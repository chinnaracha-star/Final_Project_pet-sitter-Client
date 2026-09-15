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
  <OwnerModal :open="open" @close="emit('close')">
    <div v-if="booking?.review">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-xl font-bold">Your Rating and Review</h2>
        <button type="button" class="text-2xl text-primary-500" aria-label="Close" @click="emit('close')">×</button>
      </div>
      <div class="flex gap-4">
        <img :src="auth.profile.avatarUrl" alt="" class="size-14 rounded-full object-cover" />
        <div>
          <p class="font-bold">{{ auth.profile.name }}</p>
          <p class="text-sm text-primary-500">{{ booking.review.createdAt }}</p>
        </div>
        <div class="ml-auto text-right">
          <p class="text-green-500">{{ '★'.repeat(booking.review.rating) }}</p>
          <p class="mt-1 text-sm">{{ booking.review.comment }}</p>
        </div>
      </div>
      <div class="mt-8 flex justify-center border-t border-primary-100 pt-6">
        <button type="button" class="min-h-12 rounded-full bg-orange-100 px-8 font-bold text-orange-700" @click="emit('mock')">
          View Pet Sitter
        </button>
      </div>
    </div>
  </OwnerModal>
</template>
