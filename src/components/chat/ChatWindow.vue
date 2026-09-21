<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useChatStore } from '../../stores/chat'
import ChatInput from './ChatInput.vue'
import MessageBubble from './MessageBubble.vue'

const chat = useChatStore()
const thread = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  close: []
}>()

async function scrollToLatest() {
  await nextTick()
  if (!thread.value) return
  thread.value.scrollTop = thread.value.scrollHeight
}

watch(() => chat.activeMessages.length, scrollToLatest, { immediate: true })
watch(() => chat.activeConversationId, scrollToLatest)
</script>

<template>
  <section class="flex min-w-0 flex-1 flex-col bg-white">
    <header class="flex h-[72px] items-center justify-between border-b border-primary-100 px-6">
      <div class="flex min-w-0 items-center gap-3">
        <img
          v-if="chat.activeConversation"
          :src="chat.activeConversation.ownerAvatar"
          :alt="chat.activeConversation.ownerName"
          class="size-10 rounded-full object-cover"
        />
        <h2 class="truncate text-lg font-bold text-primary-900">
          {{ chat.activeConversation?.ownerName ?? 'Messages' }}
        </h2>
      </div>
      <button
        type="button"
        class="grid size-9 place-items-center rounded-full hover:bg-primary-100"
        aria-label="Close messages"
        @click="emit('close')"
      >
        <img src="/icon/x.svg" alt="" width="14" height="14" />
      </button>
    </header>

    <div ref="thread" class="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
      <p v-if="!chat.activeConversation" class="m-auto text-sm text-primary-500">
        Select a conversation to start chatting.
      </p>
      <MessageBubble
        v-for="message in chat.activeMessages"
        :key="message.id"
        :content="message.content"
        :image-url="message.imageUrl"
        :avatar-url="chat.activeConversation?.ownerAvatar"
        :is-mine="message.isMine"
      />
    </div>

    <ChatInput v-if="chat.activeConversation" @send="chat.sendMessage" />
  </section>
</template>
