import { currentSitterId } from './sitterApproval'

export type BookingStatus = 'waiting_confirm' | 'waiting_service' | 'in_service' | 'success' | 'cancelled'
export type BookingPet = { id: number; name: string; breed: string; sex: string; ageMonths: number; color: string; weightKg: number; about: string; avatarUrl: string }
export type SitterBooking = {
  id: number; status: BookingStatus; startDate: string; endDate: string; startTime: string; endTime: string
  duration: number; durationUnit: string; totalPrice: number; transactionNo: string | null; transactionDate: string
  additionalMessage: string; owner: { name: string; email: string; phone: string; avatarUrl: string }; pets: BookingPet[]
}

async function request<T>(path: string, options: RequestInit = {}) {
  const userId = currentSitterId()
  if (!userId) throw new Error('Set petSitterUserId in localStorage or add ?userId=UUID')
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', 'X-User-Id': userId, ...options.headers } })
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail || `Request failed (${response.status})`)
  return response.json() as Promise<T>
}

export const getSitterBookings = (query = '', from?: string, to?: string) => {
  const params = new URLSearchParams({ query })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return request<SitterBooking[]>(`/api/bookings/sitter?${params}`)
}
export const getSitterBooking = (id: string | number) => request<SitterBooking>(`/api/bookings/sitter/${id}`)
export const updateBookingStatus = (id: number, status: 'waiting_service' | 'cancelled' | 'success') =>
  request<SitterBooking>(`/api/bookings/sitter/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
