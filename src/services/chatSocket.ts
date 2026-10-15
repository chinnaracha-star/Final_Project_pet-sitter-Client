import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import type { ChatMessage } from '../types/chat'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isChatUserId(value: string | null | undefined): value is string {
  return Boolean(value && UUID.test(value))
}

function brokerUrl() {
  const configured = import.meta.env.VITE_WS_URL as string | undefined
  if (configured?.trim()) return configured.trim()
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}/ws`
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function asNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

export function parseSocketMessage(body: string, currentUserId: string): ChatMessage | null {
  let parsed: unknown
  try { parsed = JSON.parse(body) } catch { return null }
  const row = asRecord(parsed)
  if (!row) return null
  const nested = asRecord(row.message) ?? asRecord(row.payload)
  const source = nested ?? row
  const id = asNumber(source.id ?? source.messageId)
  const conversationId = asNumber(source.conversationId ?? source.conversation_id ?? row.conversationId)
  const senderId = asString(source.senderId ?? source.sender_id)
  const content = asString(source.content ?? source.text ?? source.body)
  if (id === null || conversationId === null || !content) return null
  return {
    id,
    conversationId,
    senderId,
    content,
    imageUrl: asString(source.imageUrl ?? source.image_url) || null,
    sentAt: asString(source.sentAt ?? source.createdAt ?? source.created_at) || new Date().toISOString(),
    mine: senderId === currentUserId,
  }
}

export function createChatSocket(options: {
  userId: string
  token?: string
  onMessage: (message: ChatMessage) => void
}) {
  let client: Client | null = null
  const topicSubs = new Map<number, StompSubscription>()

  function connect() {
    if (client?.active) return
    const headers: Record<string, string> = { 'X-User-Id': options.userId }
    if (options.token) headers.Authorization = `Bearer ${options.token}`

    client = new Client({
      brokerURL: brokerUrl(),
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: headers,
      onConnect() {
        client?.subscribe('/user/queue/chat', (frame: IMessage) => {
          const message = parseSocketMessage(frame.body, options.userId)
          if (message) options.onMessage(message)
        })
      },
    })
    client.activate()
  }

  function subscribeConversation(conversationId: number) {
    if (!client?.connected || topicSubs.has(conversationId)) return
    const sub = client.subscribe(`/topic/conversations/${conversationId}`, (frame: IMessage) => {
      const message = parseSocketMessage(frame.body, options.userId)
      if (message) options.onMessage(message)
    })
    topicSubs.set(conversationId, sub)
  }

  function unsubscribeConversation(conversationId: number) {
    topicSubs.get(conversationId)?.unsubscribe()
    topicSubs.delete(conversationId)
  }

  function sendChat(conversationId: number, content: string) {
    if (!client?.connected || !content.trim()) return false
    client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, content: content.trim() }),
      headers: { 'content-type': 'application/json' },
    })
    return true
  }

  function markRead(conversationId: number) {
    if (!client?.connected) return
    client.publish({
      destination: '/app/chat.read',
      body: JSON.stringify({ conversationId }),
      headers: { 'content-type': 'application/json' },
    })
  }

  async function disconnect() {
    topicSubs.forEach(sub => sub.unsubscribe())
    topicSubs.clear()
    if (!client) return
    const current = client
    client = null
    await current.deactivate()
  }

  return { connect, subscribeConversation, unsubscribeConversation, sendChat, markRead, disconnect, isConnected: () => Boolean(client?.connected) }
}
