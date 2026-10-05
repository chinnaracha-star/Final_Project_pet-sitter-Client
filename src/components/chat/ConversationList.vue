<script setup lang="ts">
import { useChatStore } from '../../stores/chat'

const chat = useChatStore()
</script>

<template>
  <aside class="flex w-[84px] shrink-0 flex-col bg-[#111217] text-white sm:w-[280px]">
    <header class="flex h-[72px] items-center justify-center px-3 sm:justify-start sm:px-6">
      <h2 class="hidden text-lg font-bold sm:block">Messages</h2>
      <img class="invert sm:hidden" src="/icon/message.svg" alt="Messages" width="20" height="20" />
    </header>
    <ul class="flex-1 overflow-y-auto px-2 pb-4 sm:px-3" role="listbox" aria-label="Conversations">
      <li v-for="conversation in chat.conversations" :key="conversation.id">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-white/10 sm:px-3"
          :class="chat.activeConversationId === conversation.id ? 'bg-white/10' : ''"
          :aria-selected="chat.activeConversationId === conversation.id"
          :aria-label="conversation.ownerName"
          role="option"
          @click="chat.selectConversation(conversation.id)"
        >
          <span class="relative shrink-0">
            <img
              :src="conversation.ownerAvatar"
              :alt="conversation.ownerName"
              class="size-11 rounded-full object-cover"
            />
            <span
              v-if="conversation.unreadCount > 0"
              class="absolute top-0 right-0 size-2 rounded-full bg-orange-700"
              aria-label="Unread messages"
            />
          </span>
          <span class="hidden min-w-0 flex-1 sm:block">
            <span class="truncate text-sm font-semibold">{{ conversation.ownerName }}</span>
            <span class="mt-0.5 block truncate text-xs text-white/55">{{ conversation.lastMessage }}</span>
          </span>
        </button>
      </li>
    </ul>
  </aside>
</template>
