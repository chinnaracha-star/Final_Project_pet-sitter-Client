import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BookingStatus, SitterBooking } from '../services/sitterBookings'

export const useSitterBookingsStore = defineStore('sitterBookings', () => {
  const bookings = ref<SitterBooking[]>([])
  const searchTerm = ref('')
  const statusFilter = ref<'all' | BookingStatus>('all')

  const filteredBookings = computed(() => {
    const query = searchTerm.value.trim().toLowerCase()
    return bookings.value.filter(item =>
      (statusFilter.value === 'all' || item.status === statusFilter.value)
      && (!query || item.owner.name.toLowerCase().includes(query) || item.transactionNo?.toLowerCase().includes(query)
        || item.pets.some(p => p.name.toLowerCase().includes(query))),
    )
  })
  const hasNewBookings = computed(() => bookings.value.some(item => item.status === 'waiting_confirm' && !item.sitterViewedAt))

  function markViewed(id: number) {
    const item = bookings.value.find(booking => booking.id === id)
    if (item && !item.sitterViewedAt) item.sitterViewedAt = new Date().toISOString()
  }

  return { bookings, searchTerm, statusFilter, filteredBookings, hasNewBookings, markViewed }
})
