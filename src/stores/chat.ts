import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatConversation, ChatMessage } from '../types/chat'
import { getConversations, getMessages, markConversationRead, sendMessage as postMessage, startConversation as createConversation } from '../services/messages'
import { createChatSocket, isChatUserId } from '../services/chatSocket'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false), loading = ref(false), error = ref('')
  const activeConversationId = ref<number | null>(null)
  const conversations = ref<ChatConversation[]>([]), messages = ref<ChatMessage[]>([])
  const activeConversation = computed(() => conversations.value.find(item => item.id === activeConversationId.value) ?? null)
  const activeMessages = computed(() => messages.value)
  const unreadCount = computed(() => conversations.value.reduce((total, item) => total + item.unreadCount, 0))
  const hasUnread = computed(() => unreadCount.value > 0)

  let socket: ReturnType<typeof createChatSocket> | null = null

  function upsertMessage(message: ChatMessage) {
    const existing = messages.value.findIndex(item => item.id === message.id)
    if (existing >= 0) {
      messages.value[existing] = message
      return
    }
    const pending = messages.value.findIndex(item =>
      item.id < 0 && item.mine && item.conversationId === message.conversationId && item.content === message.content,
    )
    if (pending >= 0) messages.value[pending] = message
    else if (activeConversationId.value === message.conversationId) messages.value.push(message)

    const conversation = conversations.value.find(item => item.id === message.conversationId)
    if (conversation) {
      conversation.lastMessage = message.content ?? conversation.lastMessage
      if (!message.mine && activeConversationId.value !== message.conversationId) conversation.unreadCount += 1
    }
  }

  async function connectRealtime() {
    const auth = useAuthStore()
    if (!isChatUserId(auth.userId)) {
      await disconnectRealtime()
      return
    }
    await disconnectRealtime()
    const { data } = await supabase.auth.getSession()
    socket = createChatSocket({
      userId: auth.userId,
      token: data.session?.access_token,
      onMessage: upsertMessage,
    })
    socket.connect()
    if (activeConversationId.value !== null) socket.subscribeConversation(activeConversationId.value)
  }

  async function disconnectRealtime() {
    await socket?.disconnect()
    socket = null
  }

  async function loadConversations() {
    loading.value = true; error.value = ''
    try {
      conversations.value = await getConversations()
      if (!conversations.value.some(item => item.id === activeConversationId.value)) {
        activeConversationId.value = null
        messages.value = []
        if (conversations.value[0]) await selectConversation(conversations.value[0].id)
      } else if (activeConversationId.value !== null) {
        await selectConversation(activeConversationId.value)
      }
    } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Unable to load messages' }
    finally { loading.value = false }
  }

  async function openInbox() { isOpen.value = true; await loadConversations() }
  function closeChat() { isOpen.value = false }

  async function selectConversation(id: number) {
    const previous = activeConversationId.value
    if (previous !== null && previous !== id) socket?.unsubscribeConversation(previous)
    activeConversationId.value = id; messages.value = []; error.value = ''
    socket?.subscribeConversation(id)
    socket?.markRead(id)
    try {
      const thread = await getMessages(id)
      if (activeConversationId.value !== id) return
      messages.value = thread
      await markConversationRead(id)
      const conversation = conversations.value.find(item => item.id === id)
      if (conversation) conversation.unreadCount = 0
    } catch (cause) {
      if (activeConversationId.value === id) error.value = cause instanceof Error ? cause.message : 'Unable to load this conversation'
    }
  }

  async function startConversation(sitterId: string) {
    const conversation = await createConversation(sitterId)
    const index = conversations.value.findIndex(item => item.id === conversation.id)
    if (index >= 0) conversations.value[index] = conversation
    else conversations.value.unshift(conversation)
    await selectConversation(conversation.id)
    return conversation
  }

  async function sendMessage(content: string) {
    const id = activeConversationId.value
    const text = content.trim()
    if (!text || id === null) return false
    error.value = ''
    if (socket?.sendChat(id, text)) {
      const auth = useAuthStore()
      messages.value.push({
        id: -Date.now(),
        conversationId: id,
        senderId: auth.userId ?? '',
        content: text,
        imageUrl: null,
        sentAt: new Date().toISOString(),
        mine: true,
      })
      const conversation = conversations.value.find(item => item.id === id)
      if (conversation) conversation.lastMessage = text
      return true
    }
    try {
      const message = await postMessage(id, text)
      upsertMessage(message)
      return true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Unable to send message'
      return false
    }
  }

  return { isOpen, loading, error, activeConversationId, conversations, messages, activeConversation, activeMessages,
    unreadCount, hasUnread, loadConversations, openInbox, closeChat, selectConversation, startConversation, sendMessage,
    connectRealtime, disconnectRealtime }
})
