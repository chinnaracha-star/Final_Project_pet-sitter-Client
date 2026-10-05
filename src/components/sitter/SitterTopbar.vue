<script setup lang="ts">
import { useChatStore } from '../../stores/chat'

defineProps<{ name: string }>()

const chat = useChatStore()
</script>

<template>
  <header class="flex h-[78px] items-center justify-between border-b border-[#e0e4f2] bg-white px-9 max-[760px]:px-5">
    <div class="flex items-center gap-3.5">
      <span class="grid size-10 place-items-center rounded-full bg-[#e7e9f6]">
        <img src="/icon/user.svg" alt="" width="20" height="20" />
      </span>
      <span class="font-medium text-primary-900">{{ name || 'Jane Maison' }}</span>
    </div>
    <button
      type="button"
      class="relative grid size-11 place-items-center rounded-full hover:bg-[#f6f7fb]"
      aria-label="Open messages"
      @click="chat.openInbox()"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M13.4 3.2h5.35A3.35 3.35 0 0 1 22.1 6.55v4.15A3.35 3.35 0 0 1 18.75 14.05h-1.15l1.85 2.25-3.15-1.05h-2.9A3.35 3.35 0 0 1 10.05 10.7V6.55A3.35 3.35 0 0 1 13.4 3.2Z"
          stroke="#AEB1C4"
          stroke-width="1.7"
          stroke-linejoin="round"
        />
        <path
          d="M5.45 8.35h8.4A3.4 3.4 0 0 1 17.25 11.75v4.35A3.4 3.4 0 0 1 13.85 19.5H11.2L7.85 22.15c-.4.32-.96-.06-.82-.54l.5-1.11H5.45A3.4 3.4 0 0 1 2.05 16.1v-4.35A3.4 3.4 0 0 1 5.45 8.35Z"
          fill="#ffffff"
          stroke="#AEB1C4"
          stroke-width="1.7"
          stroke-linejoin="round"
        />
      </svg>
      <span
        v-if="chat.hasUnread"
        class="absolute top-2.5 right-2.5 size-2 rounded-full bg-orange-700"
        aria-hidden="true"
      />
    </button>
  </header>
</template>
