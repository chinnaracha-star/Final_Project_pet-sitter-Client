<script setup lang="ts">
import { onMounted } from 'vue'
import { Navbar } from '../components'
import ChatWindow from '../components/chat/ChatWindow.vue'
import ConversationList from '../components/chat/ConversationList.vue'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import { useChatStore } from '../stores/chat'

const chat = useChatStore()

onMounted(() => void chat.loadConversations())
</script>

<template>
  <OwnerPageShell title="Messages">
    <template #nav>
      <Navbar />
    </template>
    <div class="messages-panel">
      <ConversationList />
      <ChatWindow :show-close="false" />
    </div>
  </OwnerPageShell>
</template>

<style scoped>
.messages-panel {
  display: flex;
  height: min(640px, calc(100svh - 240px));
  min-height: 420px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #e8ebf5;
}
</style>
