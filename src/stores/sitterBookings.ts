import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { SitterBooking, SitterBookingStatus } from '../types/sitterBooking'

const mockBookings: SitterBooking[] = [
  {
    id: 1,
    ownerName: 'John Wick',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
    petCount: 2,
    durationLabel: '3 hours',
    bookedDateLabel: '25 Aug, 7 AM - 10 AM',
    status: 'waiting_confirm',
    hasNewBooking: true,
  },
  {
    id: 2,
    ownerName: 'Robert Jr.',
    ownerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80',
    petCount: 1,
    durationLabel: '24 hours',
    bookedDateLabel: '15 Aug, 7 AM - 10 AM',
    status: 'waiting_confirm',
    hasNewBooking: true,
  },
  {
    id: 3,
    ownerName: 'Maron Press',
    ownerAvatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=128&q=80',
    petCount: 6,
    durationLabel: '3 hours',
    bookedDateLabel: '2 Aug, 7 AM - 9 AM',
    status: 'waiting_service',
    hasNewBooking: false,
  },
  {
    id: 4,
    ownerName: 'Lincoln Veccaro',
    ownerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80',
    petCount: 4,
    durationLabel: '3 hours',
    bookedDateLabel: '25 Aug, 7 AM - 10 AM',
    status: 'in_service',
    hasNewBooking: false,
  },
  {
    id: 5,
    ownerName: 'Andaman R',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd722bf2d?auto=format&fit=crop&w=128&q=80',
    petCount: 2,
    durationLabel: '3 hours',
    bookedDateLabel: '25 Aug, 7 AM - 10 AM',
    status: 'success',
    hasNewBooking: false,
  },
  {
    id: 6,
    ownerName: 'Palwan',
    ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80',
    petCount: 2,
    durationLabel: '3 hours',
    bookedDateLabel: '25 Aug, 7 AM - 10 AM',
    status: 'success',
    hasNewBooking: false,
  },
  {
    id: 7,
    ownerName: 'Chanchai Hartnong',
    ownerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=128&q=80',
    petCount: 2,
    durationLabel: '3 hours',
    bookedDateLabel: '25 Aug, 7 AM - 10 AM',
    status: 'cancelled',
    hasNewBooking: false,
  },
  {
    id: 8,
    ownerName: 'Steve J',
    ownerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=128&q=80',
    petCount: 2,
    durationLabel: '3 hours',
    bookedDateLabel: '25 Aug, 7 AM - 10 AM',
    status: 'success',
    hasNewBooking: false,
  },
]

export const useSitterBookingsStore = defineStore('sitterBookings', () => {
  const bookings = ref<SitterBooking[]>(mockBookings.map(item => ({ ...item })))
  const searchTerm = ref('')
  const statusFilter = ref<'all' | SitterBookingStatus>('all')

  const filteredBookings = computed(() => {
    const keyword = searchTerm.value.trim().toLowerCase()
    return bookings.value.filter(booking => {
      const matchesName = booking.ownerName.toLowerCase().includes(keyword)
      const matchesStatus = statusFilter.value === 'all' || booking.status === statusFilter.value
      return matchesName && matchesStatus
    })
  })

  const hasNewBookings = computed(() => bookings.value.some(item => item.hasNewBooking))

  return { bookings, searchTerm, statusFilter, filteredBookings, hasNewBookings }
})
