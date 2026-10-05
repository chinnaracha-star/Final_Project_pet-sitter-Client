import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { conversationPeer, type ChatConversation, type ChatMessage } from '../types/chat'
import { createConversation, isChatApiUnavailable, listConversations, listMessages, postMessage } from '../services/chatApi'
import { chatSelfAvatar, hydrateConversation, hydrateConversations, mergeConversation } from '../services/chatProfile'
import { connectChatSocket, isUuid } from '../services/chatSocket'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'pet-sitter-chat-state'
const CHANNEL_NAME = 'pet-sitter-chat'
const MOCK_OWNER_ID = 'owner-john'
const MOCK_SITTER_ID = 'sitter-jane'

const seedConversations: ChatConversation[] = [
  {
    id: 1,
    ownerId: MOCK_OWNER_ID,
    ownerName: 'John Wick',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
    sitterId: MOCK_SITTER_ID,
    sitterName: 'Happy House!',
    sitterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
    lastMessage: 'So i can book an appointment now?',
    unreadCount: 1,
  },
  {
    id: 2,
    ownerId: 'owner-robert',
    ownerName: 'Robert Jr.',
    ownerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80',
    sitterId: MOCK_SITTER_ID,
    sitterName: 'Happy House!',
    sitterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
    lastMessage: 'Hello...',
    unreadCount: 0,
  },
]

const seedMessages: ChatMessage[] = [
  { id: 1, conversationId: 1, senderId: MOCK_OWNER_ID, content: 'Can i see ur place?', imageUrl: null, sentAt: '2025-08-25T09:10:00.000Z' },
  { id: 2, conversationId: 1, senderId: MOCK_SITTER_ID, content: 'Here!', imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=640&q=80', sentAt: '2025-08-25T09:12:00.000Z' },
  { id: 3, conversationId: 1, senderId: MOCK_OWNER_ID, content: 'Nice!', imageUrl: null, sentAt: '2025-08-25T09:14:00.000Z' },
  { id: 4, conversationId: 1, senderId: MOCK_OWNER_ID, content: 'So i can book an appointment now?', imageUrl: null, sentAt: '2025-08-25T09:15:00.000Z' },
  { id: 5, conversationId: 2, senderId: 'owner-robert', content: 'Hello...', imageUrl: null, sentAt: '2025-08-15T08:00:00.000Z' },
]

type StoredChat = { conversations: ChatConversation[]; messages: ChatMessage[] }

function readStoredChat(): StoredChat | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredChat
  } catch {
    return null
  }
}

function writeStoredChat(conversations: ChatConversation[], messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, messages }))
}

function isSeedConversation(item: ChatConversation) {
  return item.sitterId === MOCK_SITTER_ID
    || item.ownerId === MOCK_OWNER_ID
    || item.ownerId === 'owner-robert'
}

export const useChatStore = defineStore('chat', () => {
  const auth = useAuthStore()
  const stored = readStoredChat()
  const isOpen = ref(false)
  const isLive = ref(false)
  const isSocketOpen = ref(false)
  const activeConversationId = ref<number | null>(null)
  const conversations = ref<ChatConversation[]>(stored?.conversations.map(item => ({ ...item })) ?? seedConversations.map(item => ({ ...item })))
  const messages = ref<ChatMessage[]>(stored?.messages.map(item => ({ ...item })) ?? seedMessages.map(item => ({ ...item })))

  let channel: BroadcastChannel | null = null
  let socket: ReturnType<typeof connectChatSocket> | null = null

  const currentUserId = computed(() => {
    if (auth.userId) return auth.userId
    return auth.role === 'pet-sitter' ? MOCK_SITTER_ID : MOCK_OWNER_ID
  })

  const usesLiveIdentity = computed(() => isUuid(currentUserId.value))

  const visibleConversations = computed(() => {
    const userId = currentUserId.value
    const role = auth.role
    const inbox = usesLiveIdentity.value
      ? conversations.value.filter(item => !isSeedConversation(item))
      : conversations.value
    if (usesLiveIdentity.value) {
      return inbox.filter(item =>
        role === 'pet-sitter'
          ? !item.sitterId || item.sitterId === userId
          : !item.ownerId || item.ownerId === userId,
      )
    }
    return inbox.filter(item => {
      if (role === 'pet-sitter') return item.sitterId === MOCK_SITTER_ID
      return item.ownerId === MOCK_OWNER_ID
    })
  })

  const selfAvatar = computed(() => chatSelfAvatar())

  const activeConversation = computed(() =>
    conversations.value.find(item => item.id === activeConversationId.value) ?? null,
  )

  const activePeer = computed(() =>
    activeConversation.value ? conversationPeer(activeConversation.value, auth.role) : null,
  )

  const activeMessages = computed(() =>
    messages.value.filter(item => item.conversationId === activeConversationId.value),
  )

  const unreadCount = computed(() =>
    visibleConversations.value.reduce((total, item) => total + item.unreadCount, 0),
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  function persist() {
    writeStoredChat(conversations.value, messages.value)
  }

  function isMine(message: ChatMessage) {
    return message.senderId === currentUserId.value
  }

  function upsertMessage(message: ChatMessage, options?: { fromPeer?: boolean }) {
    if (messages.value.some(item => item.id === message.id)) return
    const duplicate = messages.value.find(item =>
      item.conversationId === message.conversationId
      && item.senderId === message.senderId
      && item.content === message.content
      && Math.abs(new Date(item.sentAt).getTime() - new Date(message.sentAt).getTime()) < 4000,
    )
    if (duplicate) return
    messages.value.push(message)
    const conversation = conversations.value.find(item => item.id === message.conversationId)
    if (conversation) {
      conversation.lastMessage = message.content || 'Photo'
      if (options?.fromPeer && message.senderId !== currentUserId.value && activeConversationId.value !== message.conversationId) {
        conversation.unreadCount += 1
      }
    }
    persist()
  }

  function selectConversation(id: number) {
    activeConversationId.value = id
    const conversation = conversations.value.find(item => item.id === id)
    if (conversation) conversation.unreadCount = 0
    persist()
    socket?.subscribeConversation(id)
    socket?.markRead(id)
    void loadMessages(id)
  }

  function openInbox() {
    isOpen.value = true
    if (activeConversationId.value === null && visibleConversations.value[0]) {
      selectConversation(visibleConversations.value[0].id)
    }
  }

  function closeChat() {
    isOpen.value = false
  }

  async function loadMessages(conversationId: number) {
    try {
      const remote = await listMessages(conversationId)
      if (!remote.length) return
      for (const message of remote) upsertMessage(message)
      isLive.value = true
    } catch (error) {
      if (!isChatApiUnavailable(error)) isLive.value = false
    }
  }

  function dropSeedState() {
    conversations.value = conversations.value.filter(item => !isSeedConversation(item))
    const liveIds = new Set(conversations.value.map(item => item.id))
    messages.value = messages.value.filter(item => liveIds.has(item.conversationId))
    if (activeConversationId.value !== null && !liveIds.has(activeConversationId.value)) {
      activeConversationId.value = null
    }
  }

  async function loadInbox() {
    try {
      const remote = await listConversations()
      const previous = new Map(conversations.value.map(item => [item.id, item]))
      conversations.value = await hydrateConversations(
        remote.map(item => mergeConversation(item, previous.get(item.id))),
      )
      isLive.value = true
      persist()
    } catch {
      isLive.value = false
      if (usesLiveIdentity.value) dropSeedState()
    }
  }

  async function sendMessage(content: string) {
    const text = content.trim()
    if (!text || activeConversationId.value === null) return
    const conversationId = activeConversationId.value
    const local: ChatMessage = {
      id: Date.now(),
      conversationId,
      senderId: currentUserId.value,
      content: text,
      imageUrl: null,
      sentAt: new Date().toISOString(),
    }
    upsertMessage(local)
    channel?.postMessage({ type: 'message', message: local })
    const sentOverSocket = socket?.sendMessage(conversationId, text) ?? false
    if (sentOverSocket) return
    try {
      const saved = await postMessage(conversationId, text)
      upsertMessage(saved)
      isLive.value = true
    } catch {
      isLive.value = false
    }
  }

  async function openWithSitter(input: { sitterId: string; sitterName: string; sitterAvatar: string }) {
    const existing = conversations.value.find(item => item.sitterId === input.sitterId && item.ownerId === currentUserId.value)
    if (existing) {
      selectConversation(existing.id)
      isOpen.value = true
      return
    }
    try {
      const created = await hydrateConversation(mergeConversation(await createConversation(input.sitterId), {
        id: 0,
        ownerId: currentUserId.value,
        ownerName: auth.profile.name || 'Pet Owner',
        ownerAvatar: auth.profile.avatarUrl,
        sitterId: input.sitterId,
        sitterName: input.sitterName,
        sitterAvatar: input.sitterAvatar,
        lastMessage: '',
        unreadCount: 0,
      }))
      conversations.value.unshift(created)
      isLive.value = true
      persist()
      selectConversation(created.id)
    } catch {
      const created: ChatConversation = {
        id: Date.now(),
        ownerId: currentUserId.value,
        ownerName: auth.profile.name || 'Pet Owner',
        ownerAvatar: auth.profile.avatarUrl,
        sitterId: input.sitterId,
        sitterName: input.sitterName,
        sitterAvatar: input.sitterAvatar,
        lastMessage: '',
        unreadCount: 0,
      }
      conversations.value.unshift(created)
      persist()
      selectConversation(created.id)
    }
    isOpen.value = true
  }

  function connect() {
    if (usesLiveIdentity.value) dropSeedState()
    void loadInbox().then(async () => {
      conversations.value = await hydrateConversations(
        usesLiveIdentity.value
          ? conversations.value.filter(item => !isSeedConversation(item))
          : conversations.value,
      )
      persist()
    })
    if (typeof BroadcastChannel !== 'undefined' && !channel) {
      channel = new BroadcastChannel(CHANNEL_NAME)
      channel.onmessage = event => {
        const payload = event.data as { type?: string; message?: ChatMessage }
        if (payload?.type === 'message' && payload.message) {
          upsertMessage(payload.message, { fromPeer: true })
        }
      }
    }
    socket?.disconnect()
    socket = connectChatSocket({
      userId: currentUserId.value,
      onMessage: message => upsertMessage(message, { fromPeer: true }),
      onOpen: () => {
        isSocketOpen.value = true
        isLive.value = true
        if (activeConversationId.value !== null) {
          socket?.subscribeConversation(activeConversationId.value)
          socket?.markRead(activeConversationId.value)
        }
      },
      onClose: () => {
        isSocketOpen.value = false
      },
    })
  }

  function disconnect() {
    channel?.close()
    channel = null
    socket?.disconnect()
    socket = null
    isSocketOpen.value = false
    closeChat()
  }

  return {
    isOpen,
    isLive,
    isSocketOpen,
    activeConversationId,
    conversations,
    visibleConversations,
    messages,
    activeConversation,
    activePeer,
    selfAvatar,
    activeMessages,
    unreadCount,
    hasUnread,
    currentUserId,
    isMine,
    openInbox,
    closeChat,
    selectConversation,
    sendMessage,
    openWithSitter,
    loadInbox,
    connect,
    disconnect,
  }
})
