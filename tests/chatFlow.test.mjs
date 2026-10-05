import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
import { createPinia, setActivePinia } from 'pinia'

test('real chat store keeps API errors and late replies out of another conversation', async () => {
  const server = await createServer({
    configFile: false,
    server: { middlewareMode: true, watch: null },
    plugins: [{
      name: 'chat-test-api',
      enforce: 'pre',
      load(id) {
        if (!id.replaceAll('\\', '/').endsWith('/services/messages.ts')) return
        return `
          export const getConversations = (...args) => globalThis.chatTestApi.list(...args)
          export const getMessages = (...args) => globalThis.chatTestApi.thread(...args)
          export const markConversationRead = async () => {}
          export const sendMessage = (...args) => globalThis.chatTestApi.send(...args)
          export const startConversation = async () => {}
        `
      },
    }],
  })
  try {
    setActivePinia(createPinia())
    const { useChatStore } = await server.ssrLoadModule('/src/stores/chat.ts')
    const chat = useChatStore()
    let finishFirst
    globalThis.chatTestApi = {
      list: async () => [{ id: 2, participantName: 'Owner', unreadCount: 0 }],
      thread: id => id === 1
        ? new Promise(resolve => { finishFirst = resolve })
        : Promise.resolve([{ id: 22, conversationId: 2, content: 'Second room' }]),
      send: async () => { throw new Error('Server unavailable') },
    }
    assert.deepEqual(chat.conversations, [])
    const first = chat.selectConversation(1)
    await chat.selectConversation(2)
    finishFirst([{ id: 11, conversationId: 1 }])
    await first
    assert.equal(chat.activeMessages[0].conversationId, 2)
    assert.equal(await chat.sendMessage('Hello'), false)
    assert.equal(chat.error, 'Server unavailable')
    assert.equal(chat.activeMessages.length, 1)
    await chat.loadConversations()
    assert.equal(chat.error, '')
    assert.equal(chat.activeMessages[0].content, 'Second room')
  } finally {
    delete globalThis.chatTestApi
    await server.close()
  }
})
