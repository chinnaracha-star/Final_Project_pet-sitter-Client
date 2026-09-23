<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'
import type { OwnerBooking } from '../../types/owner'
import OwnerModal from './OwnerModal.vue'

defineProps<{
  open: boolean
  booking: OwnerBooking | null
}>()

const emit = defineEmits<{
  close: []
  mock: []
}>()

const auth = useAuthStore()
</script>

<template>
  <OwnerModal wide :open="open" @close="emit('close')">
    <div v-if="booking?.review" class="flex min-h-[460px] flex-col">
      <div class="flex flex-nowrap items-center justify-between gap-4 border-b border-primary-100 pb-4">
        <h2 class="text-xl font-bold leading-none">Your Rating and Review</h2>
        <button type="button" class="inline-flex size-10 shrink-0 items-center justify-center text-primary-900" aria-label="Close" @click="emit('close')">
          <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <div class="mt-6 flex items-center gap-8 border-b border-primary-100 pb-6">
        <img :src="auth.profile.avatarUrl" alt="" class="size-14 shrink-0 rounded-full object-cover" />
        <div class="shrink-0">
          <p class="font-bold">{{ auth.profile.name }}</p>
          <p class="mt-1 text-sm text-primary-500">{{ booking.review.createdAt }}</p>
        </div>
        <div>
          <div class="flex gap-1 text-green-500">
            <svg v-for="star in booking.review.rating" :key="star" viewBox="0 0 24 24" class="size-5" aria-hidden="true">
              <path fill="currentColor" d="M12 2.4 14.9 8.3l6.5.9-4.7 4.6 1.1 6.5L12 17.2 6.2 20.3l1.1-6.5L2.6 9.2l6.5-.9L12 2.4Z" />
            </svg>
          </div>
          <p class="mt-2 text-sm text-primary-900">{{ booking.review.comment }}</p>
        </div>
      </div>
      <div class="flex flex-1 items-end justify-center pb-2">
        <button type="button" class="min-h-12 rounded-full bg-orange-100 px-8 font-bold text-orange-700" @click="emit('mock')">
          View Pet Sitter
        </button>
      </div>
    </div>
  </OwnerModal>
</template>
