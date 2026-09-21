import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatConversation, ChatMessage } from '../types/chat'

const CURRENT_SITTER_ID = 'sitter-jane'

const mockConversations: ChatConversation[] = [
  {
    id: 1,
    ownerId: 'owner-john',
    ownerName: 'John Wick',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
    lastMessage: 'Hi!',
    unreadCount: 1,
  },
  {
    id: 2,
    ownerId: 'owner-robert',
    ownerName: 'Robert Jr.',
    ownerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80',
    lastMessage: 'Hello...',
    unreadCount: 0,
  },
  {
    id: 3,
    ownerId: 'owner-palwan',
    ownerName: 'Palwan',
    ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80',
    lastMessage: 'How are you?',
    unreadCount: 0,
  },
]

const mockMessages: ChatMessage[] = [
  {
    id: 1,
    conversationId: 1,
    senderId: 'owner-john',
    content: 'Can i see ur place?',
    imageUrl: null,
    sentAt: '2025-08-25T09:10:00.000Z',
    isMine: false,
  },
  {
    id: 2,
    conversationId: 1,
    senderId: CURRENT_SITTER_ID,
    content: 'Here!',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=640&q=80',
    sentAt: '2025-08-25T09:12:00.000Z',
    isMine: true,
  },
  {
    id: 3,
    conversationId: 1,
    senderId: 'owner-john',
    content: 'Nice!',
    imageUrl: null,
    sentAt: '2025-08-25T09:14:00.000Z',
    isMine: false,
  },
  {
    id: 4,
    conversationId: 1,
    senderId: 'owner-john',
    content: 'So i can book an appointment now?',
    imageUrl: null,
    sentAt: '2025-08-25T09:15:00.000Z',
    isMine: false,
  },
  {
    id: 5,
    conversationId: 2,
    senderId: 'owner-robert',
    content: 'Hello...',
    imageUrl: null,
    sentAt: '2025-08-15T08:00:00.000Z',
    isMine: false,
  },
  {
    id: 6,
    conversationId: 3,
    senderId: 'owner-palwan',
    content: 'How are you?',
    imageUrl: null,
    sentAt: '2025-08-25T07:20:00.000Z',
    isMine: false,
  },
]

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false)
  const activeConversationId = ref<number | null>(null)
  const conversations = ref<ChatConversation[]>(mockConversations.map(item => ({ ...item })))
  const messages = ref<ChatMessage[]>(mockMessages.map(item => ({ ...item })))

  const activeConversation = computed(() =>
    conversations.value.find(item => item.id === activeConversationId.value) ?? null,
  )

  const activeMessages = computed(() =>
    messages.value.filter(item => item.conversationId === activeConversationId.value),
  )

  const unreadCount = computed(() =>
    conversations.value.reduce((total, item) => total + item.unreadCount, 0),
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  function openInbox() {
    isOpen.value = true
    if (activeConversationId.value === null && conversations.value[0]) {
      selectConversation(conversations.value[0].id)
    }
  }

  function closeChat() {
    isOpen.value = false
  }

  function selectConversation(id: number) {
    activeConversationId.value = id
    const conversation = conversations.value.find(item => item.id === id)
    if (conversation) conversation.unreadCount = 0
  }

  function sendMessage(content: string) {
    const text = content.trim()
    if (!text || activeConversationId.value === null) return

    messages.value.push({
      id: Date.now(),
      conversationId: activeConversationId.value,
      senderId: CURRENT_SITTER_ID,
      content: text,
      imageUrl: null,
      sentAt: new Date().toISOString(),
      isMine: true,
    })

    const conversation = conversations.value.find(item => item.id === activeConversationId.value)
    if (conversation) conversation.lastMessage = text
  }

  return {
    isOpen,
    activeConversationId,
    conversations,
    messages,
    activeConversation,
    activeMessages,
    unreadCount,
    hasUnread,
    openInbox,
    closeChat,
    selectConversation,
    sendMessage,
  }
})
