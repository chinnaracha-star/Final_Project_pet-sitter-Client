import { api } from './http'
import type { ChatConversation, ChatMessage } from '../types/chat'

export const getConversations = () => api<ChatConversation[]>('/api/messages/conversations')
export const startConversation = (sitterId: string) => api<ChatConversation>('/api/messages/conversations', {
  method: 'POST', body: JSON.stringify({ sitterId }),
})
export const getMessages = (conversationId: number) => api<ChatMessage[]>(`/api/messages/conversations/${conversationId}`)
export const sendMessage = (conversationId: number, content: string) => api<ChatMessage>(`/api/messages/conversations/${conversationId}`, {
  method: 'POST', body: JSON.stringify({ content }),
})
export const markConversationRead = (conversationId: number) =>
  api<void>(`/api/messages/conversations/${conversationId}/read`, { method: 'PATCH' })
