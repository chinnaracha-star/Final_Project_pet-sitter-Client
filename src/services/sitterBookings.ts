import { api } from './http'

export type BookingStatus = 'waiting_confirm' | 'waiting_service' | 'in_service' | 'success' | 'cancelled'
export type BookingPet = { id: number; name: string; breed: string; sex: string; ageMonths: number; color: string; weightKg: number; about: string; avatarUrl: string }
export type SitterBooking = {
  id: number; status: BookingStatus; startDate: string; endDate: string; startTime: string; endTime: string
  duration: number; durationUnit: string; totalPrice: number; transactionNo: string | null; transactionDate: string
  sitterViewedAt: string | null; additionalMessage: string
  owner: { name: string; email: string; phone: string; avatarUrl: string }; pets: BookingPet[]
}

export function getSitterBookings(query = '', from?: string, to?: string) {
  const params = new URLSearchParams({ query })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return api<SitterBooking[]>(`/api/bookings/sitter?${params}`)
}

export function getSitterBooking(id: string | number) {
  return api<SitterBooking>(`/api/bookings/sitter/${id}`)
}

export function updateBookingStatus(id: number, status: 'waiting_service' | 'cancelled' | 'success') {
  return api<SitterBooking>(`/api/bookings/sitter/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
