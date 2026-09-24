<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSitterBookingsStore } from '../../stores/sitterBookings'
import {
  SITTER_BOOKING_STATUS_CLASS,
  SITTER_BOOKING_STATUS_LABEL,
  type SitterBookingStatus,
} from '../../types/sitterBooking'

const bookings = useSitterBookingsStore()
const router = useRouter()
function open(id: number) {
  bookings.markViewed(id)
  void router.push(`/sitter/bookings/${id}`)
}

const statusOptions: Array<{ value: 'all' | SitterBookingStatus; label: string }> = [
  { value: 'all', label: 'All status' },
  { value: 'waiting_confirm', label: SITTER_BOOKING_STATUS_LABEL.waiting_confirm },
  { value: 'waiting_service', label: SITTER_BOOKING_STATUS_LABEL.waiting_service },
  { value: 'in_service', label: SITTER_BOOKING_STATUS_LABEL.in_service },
  { value: 'success', label: SITTER_BOOKING_STATUS_LABEL.success },
  { value: 'cancelled', label: SITTER_BOOKING_STATUS_LABEL.cancelled },
]
</script>

<template>
  <section>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-primary-900">Booking List</h1>
      <div class="flex flex-wrap items-center gap-3">
        <label class="relative">
          <span class="sr-only">Search bookings</span>
          <input
            v-model="bookings.searchTerm"
            class="h-10 w-[220px] rounded-full border border-primary-100 bg-white py-2 pr-10 pl-4 text-sm text-primary-900 placeholder:text-primary-300"
            type="search"
            placeholder="Search..."
          />
          <img class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" src="/icon/search.svg" alt="" />
        </label>
        <label>
          <span class="sr-only">Filter by status</span>
          <select
            v-model="bookings.statusFilter"
            class="h-10 rounded-full border border-primary-100 bg-white px-4 text-sm text-primary-700"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(40,45,70,0.04)]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead class="bg-[#111217] text-white">
            <tr>
              <th class="px-6 py-3 font-medium">Pet Owner Name</th>
              <th class="px-4 py-3 font-medium">Pet(s)</th>
              <th class="px-4 py-3 font-medium">Duration</th>
              <th class="px-4 py-3 font-medium">Booked Date</th>
              <th class="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings.filteredBookings" :key="booking.id" class="cursor-pointer border-t border-primary-100 hover:bg-primary-100/30" tabindex="0" role="link" :aria-label="`Open booking from ${booking.owner.name}`" @click="open(booking.id)" @keydown.enter="open(booking.id)">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <span v-if="booking.status === 'waiting_confirm' && !booking.sitterViewedAt" class="size-2 shrink-0 rounded-full bg-orange-700" aria-label="New booking" />
                  <span v-else class="size-2 shrink-0" aria-hidden="true" />
                  <img :src="booking.owner.avatarUrl || '/icon/user.svg'" :alt="booking.owner.name" class="size-10 rounded-full object-cover" />
                  <span class="font-medium text-primary-900">{{ booking.owner.name }}</span>
                </div>
              </td>
              <td class="px-4 py-4 text-primary-700">{{ booking.pets.length }}</td>
              <td class="px-4 py-4 text-primary-700">{{ booking.duration }} {{ booking.durationUnit }}</td>
              <td class="px-4 py-4 text-primary-700">{{ booking.startDate }} · {{ booking.startTime.slice(0, 5) }}–{{ booking.endTime.slice(0, 5) }}</td>
              <td class="px-6 py-4 font-medium" :class="SITTER_BOOKING_STATUS_CLASS[booking.status]">
                ● {{ SITTER_BOOKING_STATUS_LABEL[booking.status] }}
              </td>
            </tr>
            <tr v-if="bookings.filteredBookings.length === 0">
              <td class="px-6 py-10 text-center text-primary-500" colspan="5">No bookings match this search.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
