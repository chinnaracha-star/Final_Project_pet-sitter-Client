<script setup lang="ts">
import { ref } from 'vue'

const draft = ref('')

const emit = defineEmits<{
  send: [content: string]
}>()

function submitMessage() {
  const content = draft.value.trim()
  if (!content) return
  emit('send', content)
  draft.value = ''
}
</script>

<template>
  <form class="flex items-center gap-3 border-t border-primary-100 px-5 py-4" @submit.prevent="submitMessage">
    <label class="sr-only" for="chat-message">Message</label>
    <input
      id="chat-message"
      v-model="draft"
      class="h-12 flex-1 rounded-full border-0 bg-[#f6f7fb] px-5 text-sm text-primary-900 outline-none placeholder:text-primary-300"
      type="text"
      placeholder="Message here..."
      autocomplete="off"
    />
    <button
      class="grid size-12 shrink-0 place-items-center rounded-full bg-orange-700 text-white"
      type="submit"
      aria-label="Send message"
    >
      <span class="send-icon" aria-hidden="true"></span>
    </button>
  </form>
</template>

<style scoped>
.send-icon {
  width: 18px;
  height: 18px;
  background: white;
  -webkit-mask: url('/icon/send.svg') center / contain no-repeat;
  mask: url('/icon/send.svg') center / contain no-repeat;
}
</style>
