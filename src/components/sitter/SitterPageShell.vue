<script setup lang="ts">
import { ChatBox } from '../chat'
import SitterSidebar from './SitterSidebar.vue'
import SitterTopbar from './SitterTopbar.vue'

withDefaults(defineProps<{
  name?: string
}>(), {
  name: 'Jane Maison',
})
</script>

<template>
  <div class="flex min-h-svh bg-[#f6f7fb]">
    <SitterSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <SitterTopbar :name="name" />
      <slot />
    </div>
    <ChatBox />
  </div>
</template>
