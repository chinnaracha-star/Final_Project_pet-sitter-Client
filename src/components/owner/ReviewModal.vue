<script setup lang="ts">
import { ref, watch } from 'vue'
import OwnerModal from './OwnerModal.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [rating: number, comment: string]
}>()

const rating = ref(5)
const comment = ref('')

watch(() => props.open, open => {
  if (open) {
    rating.value = 5
    comment.value = ''
  }
})
</script>

<template>
  <OwnerModal wide :open="open" @close="emit('close')">
    <form @submit.prevent="emit('submit', rating, comment.trim())">
      <div class="flex flex-nowrap items-center justify-between gap-4 border-b border-primary-100 pb-4">
        <h2 class="text-xl font-bold leading-none">Rating & Review</h2>
        <button type="button" class="inline-flex size-10 shrink-0 items-center justify-center text-primary-900" aria-label="Close" @click="emit('close')">
          <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <p class="mt-6 text-center font-semibold">What is your rate?</p>
      <div class="mt-4 flex justify-center gap-3">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="text-green-500"
          :aria-label="`${star} star`"
          @click="rating = star"
        >
          <svg viewBox="0 0 24 24" class="size-11" aria-hidden="true">
            <path
              d="M12 2.4 14.9 8.3l6.5.9-4.7 4.6 1.1 6.5L12 17.2 6.2 20.3l1.1-6.5L2.6 9.2l6.5-.9L12 2.4Z"
              :fill="star <= rating ? 'currentColor' : 'none'"
              :stroke="star <= rating ? 'none' : 'currentColor'"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <p class="mt-6 text-center font-semibold">Share more about your experience</p>
      <textarea v-model="comment" class="mt-4 min-h-40 w-full rounded-2xl border border-primary-100 px-[18px] py-3" placeholder="Your review..." />
      <div class="mt-8 flex items-center justify-between gap-3">
        <button type="button" class="min-h-12 rounded-full bg-orange-100 px-8 font-bold text-orange-700" @click="emit('close')">Cancel</button>
        <button class="auth-submit w-auto px-8 whitespace-nowrap" type="submit">Send Review&Rating</button>
      </div>
    </form>
  </OwnerModal>
</template>
