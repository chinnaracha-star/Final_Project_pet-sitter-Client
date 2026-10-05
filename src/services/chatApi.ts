import { api, ApiError } from './http'
import type { ChatConversation, ChatMessage } from '../types/chat'
import { useAuthStore } from '../stores/auth'

type ConversationPayload = Partial<ChatConversation> & Record<string, unknown> & {
  owner_id?: string
  owner_name?: string
  owner_avatar?: string
  sitter_id?: string
  sitter_name?: string
  sitter_avatar?: string
  last_message?: string
  unread_count?: number
}

type MessagePayload = Partial<ChatMessage> & {
  conversation_id?: number
  sender_id?: string
  image_url?: string
  sent_at?: string
}

function chatHeaders(): Record<string, string> {
  const userId = useAuthStore().userId
  return userId ? { 'X-User-Id': userId } : {}
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null
}

function pickText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function asConversation(item: ConversationPayload): ChatConversation {
  const owner = asRecord(item.owner) || asRecord(item.petOwner)
  const sitter = asRecord(item.sitter) || asRecord(item.petSitter)
  return {
    id: Number(item.id),
    ownerId: pickText(item.ownerId, item.owner_id, owner?.id, owner?.userId, owner?.user_id),
    ownerName: pickText(item.ownerName, item.owner_name, owner?.name, owner?.fullName, owner?.full_name, owner?.displayName) || 'Pet Owner',
    ownerAvatar: pickText(item.ownerAvatar, item.owner_avatar, owner?.avatarUrl, owner?.avatar_url, owner?.avatar),
    sitterId: pickText(item.sitterId, item.sitter_id, sitter?.id, sitter?.userId, sitter?.user_id),
    sitterName: pickText(item.sitterName, item.sitter_name, sitter?.displayName, sitter?.display_name, sitter?.name, sitter?.fullName) || 'Pet Sitter',
    sitterAvatar: pickText(item.sitterAvatar, item.sitter_avatar, sitter?.avatarUrl, sitter?.avatar_url, sitter?.avatar),
    lastMessage: pickText(item.lastMessage, item.last_message),
    unreadCount: Number(item.unreadCount ?? item.unread_count ?? 0),
  }
}

function asMessage(item: MessagePayload): ChatMessage {
  return {
    id: Number(item.id),
    conversationId: Number(item.conversationId ?? item.conversation_id),
    senderId: String(item.senderId || item.sender_id || ''),
    content: item.content ?? null,
    imageUrl: item.imageUrl || item.image_url || null,
    sentAt: String(item.sentAt || item.sent_at || new Date().toISOString()),
  }
}

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    for (const key of ['conversations', 'messages', 'content', 'data']) {
      if (Array.isArray(record[key])) return record[key] as T[]
    }
  }
  return []
}

export async function listConversations() {
  const payload = await api<unknown>('/api/conversations', { headers: chatHeaders() })
  return unwrapList<ConversationPayload>(payload).map(asConversation)
}

export async function listMessages(conversationId: number) {
  const payload = await api<unknown>(`/api/conversations/${conversationId}/messages`, { headers: chatHeaders() })
  return unwrapList<MessagePayload>(payload).map(asMessage)
}

export async function postMessage(conversationId: number, content: string) {
  const payload = await api<MessagePayload>(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: chatHeaders(),
    body: JSON.stringify({ content }),
  })
  return asMessage(payload)
}

export async function createConversation(sitterId: string) {
  const payload = await api<ConversationPayload>('/api/conversations', {
    method: 'POST',
    headers: chatHeaders(),
    body: JSON.stringify({ sitterId }),
  })
  return asConversation(payload)
}

export function isChatApiUnavailable(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.status === 501)
}
