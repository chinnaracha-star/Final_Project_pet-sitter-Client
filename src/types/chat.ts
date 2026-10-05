export interface ChatConversation {
  id: number
  ownerId: string
  ownerName: string
  ownerAvatar: string
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
  isMine: boolean
}
