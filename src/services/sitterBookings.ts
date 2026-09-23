import { currentSitterId } from './sitterApproval'
import { isSitterDemo } from './sitterDemo'
import { useSitterBookingsStore } from '../stores/sitterBookings'

export type BookingStatus = 'waiting_confirm' | 'waiting_service' | 'in_service' | 'success' | 'cancelled'
export type BookingPet = { id: number; name: string; breed: string; sex: string; ageMonths: number; color: string; weightKg: number; about: string; avatarUrl: string }
export type SitterBooking = {
  id: number; status: BookingStatus; startDate: string; endDate: string; startTime: string; endTime: string
  duration: number; durationUnit: string; totalPrice: number; transactionNo: string | null; transactionDate: string
  additionalMessage: string; owner: { name: string; email: string; phone: string; avatarUrl: string }; pets: BookingPet[]
}

async function request<T>(path: string, options: RequestInit = {}) {
  const userId = currentSitterId()
  if (!userId) throw new Error('Server integration pending. Select “Use demo data” to preview bookings.')
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', 'X-User-Id': userId, ...options.headers } })
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail || `Request failed (${response.status})`)
  return response.json() as Promise<T>
}

export function getSitterBookings(query = '', from?: string, to?: string) {
  if (isSitterDemo()) {
    const needle = query.trim().toLowerCase()
    return Promise.resolve(useSitterBookingsStore().bookings.filter(booking =>
      (!from || booking.endDate >= from) && (!to || booking.startDate <= to)
      && (!needle || booking.owner.name.toLowerCase().includes(needle)
        || booking.transactionNo?.toLowerCase().includes(needle)
        || booking.pets.some(pet => pet.name.toLowerCase().includes(needle))),
    ))
  }
  const params = new URLSearchParams({ query })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return request<SitterBooking[]>(`/api/bookings/sitter?${params}`)
}

export function getSitterBooking(id: string | number) {
  if (isSitterDemo()) {
    const store = useSitterBookingsStore()
    const booking = store.bookings.find(item => item.id === Number(id))
    if (!booking) return Promise.reject(new Error('Booking not found'))
    store.markViewed(booking.id)
    return Promise.resolve(booking)
  }
  return request<SitterBooking>(`/api/bookings/sitter/${id}`)
}

export function updateBookingStatus(id: number, status: 'waiting_service' | 'cancelled' | 'success') {
  if (isSitterDemo()) {
    try {
      return Promise.resolve(useSitterBookingsStore().changeStatus(id, status))
    } catch (error) {
      return Promise.reject(error)
    }
  }
  return request<SitterBooking>(`/api/bookings/sitter/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
