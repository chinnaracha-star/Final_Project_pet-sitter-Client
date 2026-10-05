import { Client, type StompSubscription } from '@stomp/stompjs'
import type { ChatMessage } from '../types/chat'

export type ChatSocketHandlers = {
  userId: string
  onMessage: (message: ChatMessage) => void
  onOpen?: () => void
  onClose?: () => void
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function brokerUrl() {
  const configured = String(import.meta.env.VITE_WS_URL || '').replace(/\/+$/, '')
  if (configured) return configured
  const port = import.meta.env.VITE_API_PORT || '8082'
  return `ws://localhost:${port}/ws`
}

function parseIncoming(raw: string): ChatMessage | null {
  try {
    const payload = JSON.parse(raw) as Record<string, unknown>
    const body = payload.type === 'message' || payload.type === 'chat'
      ? payload
      : payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : payload
    const conversationId = Number(body.conversationId ?? body.conversation_id)
    const senderId = String(body.senderId || body.sender_id || '')
    if (!conversationId || !senderId) return null
    return {
      id: Number(body.id || Date.now()),
      conversationId,
      senderId,
      content: (body.content as string | null) ?? null,
      imageUrl: (body.imageUrl || body.image_url || null) as string | null,
      sentAt: String(body.sentAt || body.sent_at || new Date().toISOString()),
    }
  } catch {
    return null
  }
}

export function connectChatSocket(handlers: ChatSocketHandlers) {
  if (!handlers.userId || !isUuid(handlers.userId)) {
    return {
      connected: false,
      disconnect() {},
      subscribeConversation() {},
      sendMessage() { return false },
      markRead() {},
    }
  }

  const roomSubs = new Map<number, StompSubscription>()
  let pendingRoomId: number | null = null

  function handleFrame(body: string) {
    const message = parseIncoming(body)
    if (message) handlers.onMessage(message)
  }

  const client = new Client({
    brokerURL: brokerUrl(),
    connectHeaders: { 'X-User-Id': handlers.userId },
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      handlers.onOpen?.()
      client.subscribe('/user/queue/chat', frame => handleFrame(frame.body))
      if (pendingRoomId !== null) subscribeConversation(pendingRoomId)
    },
    onWebSocketClose: () => handlers.onClose?.(),
    onStompError: () => handlers.onClose?.(),
  })

  function subscribeConversation(conversationId: number) {
    pendingRoomId = conversationId
    if (!client.connected) return
    if (roomSubs.has(conversationId)) return
    for (const [id, sub] of roomSubs) {
      if (id !== conversationId) {
        sub.unsubscribe()
        roomSubs.delete(id)
      }
    }
    const sub = client.subscribe(`/topic/conversations/${conversationId}`, frame => handleFrame(frame.body))
    roomSubs.set(conversationId, sub)
  }

  client.activate()

  return {
    connected: true,
    disconnect() {
      for (const sub of roomSubs.values()) sub.unsubscribe()
      roomSubs.clear()
      void client.deactivate()
    },
    subscribeConversation,
    sendMessage(conversationId: number, content: string) {
      if (!client.connected) return false
      client.publish({
        destination: '/app/chat.send',
        headers: { 'X-User-Id': handlers.userId },
        body: JSON.stringify({ conversationId, content }),
      })
      return true
    },
    markRead(conversationId: number) {
      if (!client.connected) return
      client.publish({
        destination: '/app/chat.read',
        headers: { 'X-User-Id': handlers.userId },
        body: JSON.stringify({ conversationId }),
      })
    },
  }
}
