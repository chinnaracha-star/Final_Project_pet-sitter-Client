<script setup lang="ts">
import { computed, watch } from 'vue'
import { ChatBox } from './components/chat'
import { useAuthStore } from './stores/auth'
import { useChatStore } from './stores/chat'

const auth = useAuthStore()
const chat = useChatStore()
const canChat = computed(() => auth.isOwnerLoggedIn || auth.role === 'pet-sitter')

watch(
  () => [canChat.value, auth.userId] as const,
  ([ok]) => {
    if (ok) chat.connect()
    else chat.disconnect()
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
  <ChatBox v-if="canChat" />
</template>
