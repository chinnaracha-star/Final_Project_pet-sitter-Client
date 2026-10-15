<script setup lang="ts">
import { watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useChatStore } from './stores/chat'

const auth = useAuthStore()
const chat = useChatStore()

watch(
  () => [auth.isLoggedIn, auth.userId, auth.role] as const,
  ([loggedIn, userId, role]) => {
    if (loggedIn && userId && (role === 'owner' || role === 'pet-sitter')) void chat.connectRealtime()
    else void chat.disconnectRealtime()
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
