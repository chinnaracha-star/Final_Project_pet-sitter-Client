import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BookingPet, BookingStatus, SitterBooking } from '../services/sitterBookings'
import { isSitterDemo } from '../services/sitterDemo'
import { canChangeDemoBooking } from '../services/sitterDemoLogic'

const storageKey = 'petSitterDemoBookingsV1'
const today = (offset: number) => new Date(Date.now() + offset * 86_400_000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' })
const pet: BookingPet[] = [
  { id: 1, name: 'Bubble', breed: 'Cat', sex: 'Male', ageMonths: 24, color: 'Grey', weightKg: 4.2, about: 'Calm and friendly.', avatarUrl: '/image/cat.jpg' },
  { id: 2, name: 'Daisy', breed: 'Dog', sex: 'Female', ageMonths: 36, color: 'Brown', weightKg: 8.5, about: 'Playful and loves walks.', avatarUrl: '/image/dog1.jpg' },
]
const owner = (name: string) => ({ name, email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`, phone: '099 996 6734', avatarUrl: '/navbar/profile.png' })
const seed = (id: number, status: BookingStatus, offset: number, name: string, start: string, end: string, amount: number, pets: BookingPet[]): SitterBooking => ({
  id, status, startDate: today(offset), endDate: today(offset), startTime: `${start}:00`, endTime: `${end}:00`,
  duration: Number(end.slice(0, 2)) - Number(start.slice(0, 2)), durationUnit: 'hours', totalPrice: amount,
  transactionNo: `MOCK-${id}`, transactionDate: new Date().toISOString(), additionalMessage: id === 101 ? 'Please feed Daisy after the walk.' : '',
  owner: owner(name), pets,
})
const seeds: SitterBooking[] = [
  seed(101, 'waiting_confirm', 1, 'John Wick', '09:00', '12:00', 900, pet),
  seed(102, 'waiting_confirm', 2, 'Robert Jr.', '10:00', '13:00', 1200, [pet[0]]),
  seed(103, 'waiting_service', 3, 'Maron Press', '13:00', '16:00', 800, [pet[1]]),
  seed(104, 'waiting_service', 4, 'Alice Smith', '08:00', '11:00', 1100, pet),
  seed(105, 'in_service', -1, 'Lincoln Veccaro', '09:00', '12:00', 1500, [pet[1]]),
  seed(106, 'success', -2, 'Jane Wilson', '10:00', '13:00', 1500, [pet[1]]),
  seed(107, 'success', -3, 'Palwan', '11:00', '14:00', 4000, pet),
  seed(108, 'cancelled', -4, 'Chanchai Hartnong', '14:00', '17:00', 1000, [pet[0]]),
]

function savedDemo() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}') as { statuses?: Record<string, BookingStatus>; viewed?: number[] }
  } catch {
    return {} as { statuses?: Record<string, BookingStatus>; viewed?: number[] }
  }
}

export const useSitterBookingsStore = defineStore('sitterBookings', () => {
  const saved = savedDemo()
  const bookings = ref<SitterBooking[]>(isSitterDemo() ? seeds.map(item => ({ ...item, status: saved.statuses?.[item.id] || item.status })) : [])
  const viewed = ref<number[]>(saved.viewed || [])
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
  const hasNewBookings = computed(() => bookings.value.some(item => item.status === 'waiting_confirm' && !viewed.value.includes(item.id)))

  function persist() {
    localStorage.setItem(storageKey, JSON.stringify({
      statuses: Object.fromEntries(bookings.value.map(item => [item.id, item.status])),
      viewed: viewed.value,
    }))
  }
  function markViewed(id: number) {
    if (!viewed.value.includes(id)) {
      viewed.value.push(id)
      persist()
    }
  }
  function changeStatus(id: number, next: 'waiting_service' | 'cancelled' | 'success') {
    const item = bookings.value.find(booking => booking.id === id)
    if (!item) throw new Error('Booking not found')
    if (!canChangeDemoBooking(item.status, next)) throw new Error('Invalid booking status transition')
    item.status = next
    persist()
    return item
  }

  return { bookings, viewed, searchTerm, statusFilter, filteredBookings, hasNewBookings, markViewed, changeStatus }
})
