<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../../stores/chat'
import ChatWindow from './ChatWindow.vue'
import ConversationList from './ConversationList.vue'

const chat = useChatStore()

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') chat.closeChat()
}

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onUnmounted(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="chat.isOpen"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      @click.self="chat.closeChat()"
    >
      <div
        class="flex h-[min(720px,90svh)] w-full max-w-[980px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Messages"
      >
        <ConversationList />
        <ChatWindow @close="chat.closeChat()" />
      </div>
    </div>
  </Teleport>
</template>
