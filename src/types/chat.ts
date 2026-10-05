export interface ChatConversation {
  id: number
  ownerId: string
  ownerName: string
  ownerAvatar: string
  sitterId: string
  sitterName: string
  sitterAvatar: string
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
}

export interface ChatPeer {
  id: string
  name: string
  avatar: string
}

export function conversationPeer(conversation: ChatConversation, role: string | null): ChatPeer {
  if (role === 'pet-sitter') {
    return {
      id: conversation.ownerId,
      name: conversation.ownerName,
      avatar: conversation.ownerAvatar,
    }
  }
  return {
    id: conversation.sitterId,
    name: conversation.sitterName,
    avatar: conversation.sitterAvatar,
  }
}
