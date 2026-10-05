export interface ChatConversation {
  id: number
  participantId: string
  participantName: string
  participantAvatar: string | null
  lastMessage: string
  unreadCount: number
}

export interface ChatMessage {
  id: number
  conversationId: number
  senderId: string
  content: string | null
  imageUrl: string | null
  sentAt: string
  mine: boolean
}
