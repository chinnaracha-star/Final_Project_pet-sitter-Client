<script setup lang="ts">
import type { OwnerBooking } from '../../types/owner'
import OwnerModal from './OwnerModal.vue'

defineProps<{
  open: boolean
  booking: OwnerBooking | null
}>()

const emit = defineEmits<{
  close: []
  mock: [action: string]
}>()

const statusLabel: Record<OwnerBooking['status'], string> = {
  pending: 'Waiting for confirm',
  confirmed: 'Confirmed',
  in_service: 'In service',
  completed: 'Success',
  cancelled: 'Cancelled',
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  const day = date.toLocaleDateString('en-GB', { day: '2-digit' })
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  return `${day} ${month}. ${date.getFullYear()}`
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return minutes ? `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}` : `${hour12} ${suffix}`
}
</script>

<template>
  <OwnerModal wide :open="open" @close="emit('close')">
    <div v-if="booking">
      <div class="flex flex-nowrap items-center justify-between gap-4 border-b border-primary-100 pb-4">
        <h2 class="text-xl font-bold leading-none">Booking Detail</h2>
        <button type="button" class="inline-flex size-10 shrink-0 items-center justify-center text-primary-900" aria-label="Close" @click="emit('close')">
          <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <p class="mt-6 flex items-center gap-2 font-medium text-pink-500">
        <span class="size-1.5 rounded-full bg-pink-500" aria-hidden="true" />
        {{ statusLabel[booking.status] }}
      </p>
      <div class="mt-8 space-y-1 text-sm text-primary-500">
        <p>Transaction date: {{ booking.transactionDate }}</p>
        <p>Transaction No. : {{ booking.transactionNo }}</p>
      </div>
      <div class="mt-8 flex items-end justify-between gap-4">
        <div>
          <p class="text-sm text-primary-500">Pet Sitter:</p>
          <p class="mt-2 font-bold">{{ booking.sitterName }} By {{ booking.sitterOwner }}</p>
        </div>
        <button type="button" class="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700" @click="emit('mock', 'View Map')">
          <svg viewBox="0 0 24 24" class="size-5" fill="currentColor" aria-hidden="true">
            <path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5c0 4.8 6.5 12.5 6.5 12.5s6.5-7.7 6.5-12.5A6.5 6.5 0 0 0 12 2.5Zm0 8.8a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6Z" />
          </svg>
          View Map
        </button>
      </div>
      <div class="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p class="text-sm text-primary-500">Date & Time:</p>
          <p class="mt-2 font-bold">{{ formatDate(booking.startDate) }} | {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</p>
        </div>
        <div>
          <p class="text-sm text-primary-500">Duration:</p>
          <p class="mt-2 font-bold">{{ booking.durationHours }} hours</p>
        </div>
      </div>
      <div class="mt-8">
        <p class="text-sm text-primary-500">Pet:</p>
        <p class="mt-2 font-bold">{{ booking.petNames.join(', ') }}</p>
      </div>
      <div class="mt-8 flex items-center justify-between border-t border-primary-100 pt-6 font-bold">
        <p>Total</p>
        <p>{{ booking.totalPrice }} THB</p>
      </div>
    </div>
  </OwnerModal>
</template>
