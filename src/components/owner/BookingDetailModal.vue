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
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`
}
</script>

<template>
  <OwnerModal :open="open" @close="emit('close')">
    <div v-if="booking">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-xl font-bold">Booking Detail</h2>
        <button type="button" class="text-2xl text-primary-500" aria-label="Close" @click="emit('close')">×</button>
      </div>
      <p class="font-medium text-pink-500">● {{ statusLabel[booking.status] }}</p>
      <p class="mt-2 text-sm text-primary-500">Transaction date: {{ booking.transactionDate }}</p>
      <p class="text-sm text-primary-500">Transaction No : {{ booking.transactionNo }}</p>
      <div class="mt-5 flex items-start justify-between gap-3 border-t border-primary-100 pt-4">
        <div>
          <p class="text-sm text-primary-500">Pet Sitter:</p>
          <p class="font-bold">{{ booking.sitterName }} By {{ booking.sitterOwner }}</p>
        </div>
        <button type="button" class="text-sm font-semibold text-orange-700" @click="emit('mock', 'View Map')">
          View Map
        </button>
      </div>
      <div class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <p><span class="text-primary-500">Date & Time:</span><br />{{ formatDate(booking.startDate) }} | {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</p>
        <p><span class="text-primary-500">Duration:</span><br />{{ booking.durationHours }} hours</p>
      </div>
      <p class="mt-3 text-sm"><span class="text-primary-500">Pet:</span><br />{{ booking.petNames.join(', ') }}</p>
      <p class="mt-5 border-t border-primary-100 pt-4 text-right font-bold">Total {{ booking.totalPrice }} THB</p>
    </div>
  </OwnerModal>
</template>
