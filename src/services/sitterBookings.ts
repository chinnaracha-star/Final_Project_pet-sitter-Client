import { currentSitterId } from './sitterApproval'

export type BookingStatus = 'waiting_confirm' | 'waiting_service' | 'in_service' | 'success' | 'cancelled'
export type BookingPet = { id: number; name: string; breed: string; sex: string; ageMonths: number; color: string; weightKg: number; about: string; avatarUrl: string }
export type SitterBooking = {
  id: number; status: BookingStatus; startDate: string; endDate: string; startTime: string; endTime: string
  duration: number; durationUnit: string; totalPrice: number; transactionNo: string | null; transactionDate: string
  additionalMessage: string; owner: { name: string; email: string; phone: string; avatarUrl: string }; pets: BookingPet[]
}

const iso = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
const day = (offset: number) => { const date = new Date(); date.setDate(date.getDate() + offset); return iso(date) }
const owner = { name: 'John Wick', email: 'johnwick@example.com', phone: '099 996 6734', avatarUrl: '/navbar/profile.png' }
const pets: BookingPet[] = [
  { id: 1, name: 'Bubble', breed: 'Cat', sex: 'Male', ageMonths: 24, color: 'Grey', weightKg: 4.2, about: 'Calm and friendly.', avatarUrl: '/image/cat.jpg' },
  { id: 2, name: 'Daisy', breed: 'Dog', sex: 'Female', ageMonths: 36, color: 'Brown', weightKg: 8.5, about: 'Playful and loves walks.', avatarUrl: '/image/dog1.jpg' },
]
const mockBookings: SitterBooking[] = [
  { id: 101, status: 'waiting_confirm', startDate: day(1), endDate: day(1), startTime: '09:00:00', endTime: '12:00:00', duration: 3, durationUnit: 'hours', totalPrice: 900, transactionNo: 'MOCK-101', transactionDate: new Date().toISOString(), additionalMessage: 'Please feed Daisy after the walk.', owner, pets },
  { id: 102, status: 'waiting_service', startDate: day(2), endDate: day(2), startTime: '13:00:00', endTime: '16:00:00', duration: 3, durationUnit: 'hours', totalPrice: 1200, transactionNo: 'MOCK-102', transactionDate: new Date().toISOString(), additionalMessage: '', owner: { ...owner, name: 'Alice Smith' }, pets: [pets[0]] },
  { id: 103, status: 'in_service', startDate: day(0), endDate: day(0), startTime: '00:00:00', endTime: '00:01:00', duration: 3, durationUnit: 'hours', totalPrice: 800, transactionNo: 'MOCK-103', transactionDate: new Date().toISOString(), additionalMessage: 'Emergency contact is in the pet notes.', owner: { ...owner, name: 'Peter Parker' }, pets },
  { id: 104, status: 'success', startDate: day(-1), endDate: day(-1), startTime: '10:00:00', endTime: '13:00:00', duration: 3, durationUnit: 'hours', totalPrice: 1500, transactionNo: 'MOCK-104', transactionDate: new Date(Date.now() - 86400000).toISOString(), additionalMessage: '', owner: { ...owner, name: 'Jane Wilson' }, pets: [pets[1]] },
]

const useMock = () => localStorage.getItem('petSitterUseMock') === 'true' || !currentSitterId()

async function request<T>(path: string, options: RequestInit = {}) {
  const userId = currentSitterId()
  if (!userId) throw new Error('Set petSitterUserId in localStorage or add ?userId=UUID')
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', 'X-User-Id': userId, ...options.headers } })
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail || `Request failed (${response.status})`)
  return response.json() as Promise<T>
}

export const getSitterBookings = (query = '', from?: string, to?: string) => {
  if (useMock()) {
    const needle = query.trim().toLowerCase()
    return Promise.resolve(mockBookings.filter(b => (!from || b.endDate >= from) && (!to || b.startDate <= to))
      .filter(b => !needle || b.owner.name.toLowerCase().includes(needle) || b.transactionNo?.toLowerCase().includes(needle) || b.pets.some(p => p.name.toLowerCase().includes(needle))))
  }
  const params = new URLSearchParams({ query })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return request<SitterBooking[]>(`/api/bookings/sitter?${params}`)
}
export const getSitterBooking = (id: string | number) => useMock()
  ? Promise.resolve(mockBookings.find(b => b.id === Number(id)) || mockBookings[0])
  : request<SitterBooking>(`/api/bookings/sitter/${id}`)
export const updateBookingStatus = (id: number, status: 'waiting_service' | 'cancelled' | 'success') => {
  if (useMock()) {
    const booking = mockBookings.find(b => b.id === id) || mockBookings[0]
    booking.status = status
    return Promise.resolve(booking)
  }
  return request<SitterBooking>(`/api/bookings/sitter/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
