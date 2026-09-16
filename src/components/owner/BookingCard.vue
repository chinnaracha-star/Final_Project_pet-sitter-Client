<script setup lang="ts">
import type { OwnerBooking } from '../../types/owner'

defineProps<{
  booking: OwnerBooking
}>()

const emit = defineEmits<{
  open: []
  report: []
  review: []
  yourReview: []
  mock: [action: string]
}>()

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

const statusLabel: Record<OwnerBooking['status'], string> = {
  pending: 'Waiting for confirm',
  confirmed: 'Confirmed',
  in_service: 'In service',
  completed: 'Success',
  cancelled: 'Cancelled',
}
</script>

<template>
  <article
    class="cursor-pointer rounded-2xl border border-primary-100 p-5 shadow-sm"
    :class="booking.status === 'in_service' ? 'border-blue-500' : ''"
    @click="emit('open')"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex gap-3">
        <img :src="booking.sitterAvatar" alt="" class="size-14 rounded-full object-cover" />
        <div>
          <h2 class="text-lg font-bold text-primary-900">{{ booking.sitterName }}</h2>
          <p class="text-sm text-primary-500">By {{ booking.sitterOwner }}</p>
        </div>
      </div>
      <div class="text-right text-sm">
        <p class="text-primary-500">
          {{ booking.status === 'in_service' ? 'Booking date' : 'Transaction date' }}:
          {{ booking.transactionDate }}
        </p>
        <p
          class="mt-1 font-medium"
          :class="booking.status === 'pending' ? 'text-pink-500' : booking.status === 'in_service' ? 'text-blue-500' : 'text-green-500'"
        >
          ● {{ statusLabel[booking.status] }}
        </p>
      </div>
    </div>

    <div class="mt-4 grid gap-4 text-sm sm:grid-cols-3">
      <div>
        <p class="text-primary-500">Date & Time:</p>
        <p class="font-medium text-primary-900">
          {{ formatDate(booking.startDate) }}
          <span class="mx-2 text-primary-300">|</span>
          {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}
          <button
            v-if="booking.status === 'pending'"
            type="button"
            class="ml-2 text-orange-700"
            @click.stop="emit('mock', 'Change')"
          >
            Change
          </button>
        </p>
      </div>
      <div>
        <p class="text-primary-500">Duration:</p>
        <p class="font-medium">{{ booking.durationHours }} hours</p>
      </div>
      <div>
        <p class="text-primary-500">Pet:</p>
        <p class="font-medium">{{ booking.petNames.join(', ') }}</p>
      </div>
    </div>

    <div
      v-if="booking.status === 'pending' || booking.status === 'in_service'"
      class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-100/50 px-4 py-3"
    >
      <p class="text-sm text-primary-700">{{ booking.bannerText }}</p>
      <div class="flex gap-2">
        <button type="button" class="auth-submit min-h-10 px-5 text-sm" @click.stop="emit('mock', 'Send Message')">
          Send Message
        </button>
        <button
          type="button"
          class="grid size-10 place-items-center rounded-full bg-orange-100"
          @click.stop="emit('mock', 'Call')"
        >
          <img src="/icon/phone.svg" alt="Call" class="size-5" />
        </button>
      </div>
    </div>

    <div
      v-else-if="booking.status === 'completed'"
      class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-green-100 px-4 py-3"
    >
      <p class="text-sm text-green-500">Success date: {{ booking.completedAt }}</p>
      <div class="flex gap-2">
        <button type="button" class="text-sm font-semibold text-orange-700" @click.stop="emit('report')">Report</button>
        <button
          v-if="!booking.review"
          type="button"
          class="auth-submit min-h-10 px-5 text-sm"
          @click.stop="emit('review')"
        >
          Review
        </button>
        <button
          v-else
          type="button"
          class="min-h-10 rounded-full bg-orange-100 px-5 text-sm font-bold text-orange-700"
          @click.stop="emit('yourReview')"
        >
          Your Review
        </button>
      </div>
    </div>
  </article>
</template>
