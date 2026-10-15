<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ChatBox } from '../chat'
import SitterSidebar from './SitterSidebar.vue'
import SitterTopbar from './SitterTopbar.vue'

const props = defineProps<{
  name?: string
  avatarUrl?: string
}>()

const auth = useAuthStore()
const displayName = computed(() => props.name?.trim() || auth.profile.name || auth.profile.email)
const displayAvatar = computed(() => props.avatarUrl?.trim() || auth.profile.avatarUrl)
</script>

<template>
  <div class="flex min-h-svh bg-[#f6f7fb]">
    <SitterSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <SitterTopbar :name="displayName" :avatar-url="displayAvatar" />
      <slot />
    </div>
    <ChatBox />
  </div>
</template>
