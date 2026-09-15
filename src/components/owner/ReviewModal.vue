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
  <OwnerModal :open="open" @close="emit('close')">
    <form @submit.prevent="emit('submit', rating, comment.trim())">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-xl font-bold">Rating & Review</h2>
        <button type="button" class="text-2xl text-primary-500" aria-label="Close" @click="emit('close')">×</button>
      </div>
      <p class="text-center font-semibold">What is your rate?</p>
      <div class="mt-3 flex justify-center gap-2">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="text-3xl"
          :class="star <= rating ? 'text-green-500' : 'text-primary-100'"
          @click="rating = star"
        >
          ★
        </button>
      </div>
      <p class="mt-6 text-center font-semibold">Share more about your experience</p>
      <textarea v-model="comment" class="mt-3 min-h-28 w-full rounded-2xl border border-primary-100 px-[18px] py-3" placeholder="Your review..." />
      <div class="mt-8 flex justify-end gap-3">
        <button type="button" class="min-h-12 rounded-full bg-orange-100 px-8 font-bold text-orange-700" @click="emit('close')">Cancel</button>
        <button class="auth-submit px-6 text-sm" type="submit">Send Review&Rating</button>
      </div>
    </form>
  </OwnerModal>
</template>
