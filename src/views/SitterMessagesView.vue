<script setup lang="ts">
import { onMounted } from 'vue'
import ChatWindow from '../components/chat/ChatWindow.vue'
import ConversationList from '../components/chat/ConversationList.vue'
import SitterDemoNotice from '../components/sitter/SitterDemoNotice.vue'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
import { useChatStore } from '../stores/chat'

const chat = useChatStore()
onMounted(() => {
  if (chat.activeConversationId === null && chat.conversations[0]) chat.selectConversation(chat.conversations[0].id)
})
</script>

<template>
  <SitterPageShell>
    <main class="messages-page">
      <SitterDemoNotice :always-demo="true" />
      <h1>Messages</h1>
      <div class="messages-panel">
        <ConversationList />
        <ChatWindow :show-close="false" />
      </div>
    </main>
  </SitterPageShell>
</template>

<style scoped>
.messages-page { min-height: calc(100svh - 78px); padding: 32px; background: #f7f8fc; }
h1 { margin: 0 0 20px; font-size: 24px; font-weight: 700; }
.messages-panel { display: flex; height: min(720px, calc(100svh - 215px)); min-height: 420px; overflow: hidden; border-radius: 12px; background: #fff; }
@media (max-width: 760px) { .messages-page { padding: 20px; } }
</style>
