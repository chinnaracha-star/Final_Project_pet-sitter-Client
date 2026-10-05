import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatConversation, ChatMessage } from '../types/chat'
import { getConversations, getMessages, markConversationRead, sendMessage as postMessage, startConversation as createConversation } from '../services/messages'

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false), loading = ref(false), error = ref('')
  const activeConversationId = ref<number | null>(null)
  const conversations = ref<ChatConversation[]>([]), messages = ref<ChatMessage[]>([])
  const activeConversation = computed(() => conversations.value.find(item => item.id === activeConversationId.value) ?? null)
  const activeMessages = computed(() => messages.value)
  const unreadCount = computed(() => conversations.value.reduce((total, item) => total + item.unreadCount, 0))
  const hasUnread = computed(() => unreadCount.value > 0)

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
    activeConversationId.value = id; messages.value = []; error.value = ''
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
    if (!content.trim() || id === null) return false
    error.value = ''
    try {
      const message = await postMessage(id, content.trim())
      if (activeConversationId.value === id) messages.value.push(message)
      const conversation = conversations.value.find(item => item.id === id)
      if (conversation) conversation.lastMessage = content.trim()
      return true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Unable to send message'
      return false
    }
  }

  return { isOpen, loading, error, activeConversationId, conversations, messages, activeConversation, activeMessages,
    unreadCount, hasUnread, loadConversations, openInbox, closeChat, selectConversation, startConversation, sendMessage }
})
