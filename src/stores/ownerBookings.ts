import { ref } from 'vue'
import { defineStore } from 'pinia'
import { changeOwnerBookingSchedule, listOwnerBookings, reportOwnerBooking, reviewOwnerBooking } from '../services/ownerApi'
import type { OwnerBooking } from '../types/owner'

export const useOwnerBookingsStore = defineStore('ownerBookings', () => {
  const bookings = ref<OwnerBooking[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      bookings.value = await listOwnerBookings()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not load booking history'
    } finally {
      loading.value = false
    }
  }

  function replace(booking: OwnerBooking) {
    const index = bookings.value.findIndex(item => item.id === booking.id)
    if (index >= 0) bookings.value[index] = booking
  }

  async function changeSchedule(id: number, schedule: { startDate: string; endDate: string; startTime: string; endTime: string }) {
    replace(await changeOwnerBookingSchedule(id, schedule))
  }

  async function addReview(id: number, rating: number, comment: string) {
    replace(await reviewOwnerBooking(id, rating, comment))
  }

  async function addReport(id: number, issue: string, description: string) {
    await reportOwnerBooking(id, issue, description)
  }

  return { bookings, loading, error, load, changeSchedule, addReview, addReport }
})
