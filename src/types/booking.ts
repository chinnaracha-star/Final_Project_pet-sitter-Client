export interface BookingSchedule {
  date: string // ISO string 'YYYY-MM-DD'
  formattedDate: string // e.g. '25 Aug, 2023'
  startTime: string // e.g. '7 AM' or '8:30 AM'
  endTime: string // e.g. '10 AM' or '9:30 AM'
  sitterId?: number | string
}

export interface TimeSlotOption {
  value: string
  label: string
}

export interface SitterBookingSummary {
  id?: string
  placeName: string // e.g. 'Happy House!'
  ownerName: string // e.g. 'Jane Maison'
  hourlyRate: number // e.g. 200
}

export interface BookingCustomerInfo {
  name: string
  email: string
  phone: string
  additionalMessage?: string
}

export type PaymentMethod = 'credit_card' | 'cash'

export interface CreditCardInfo {
  cardNumber: string
  cardOwner: string
  expiryDate: string
  cvv: string
}

export type BookingStep = 'calendar' | 'your-pet' | 'information' | 'payment'

/**
 * Parses time string like "8:30 AM", "7 AM", "10:00 AM" into minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const clean = timeStr.trim().toUpperCase()
  const isPM = clean.includes('PM')
  const isAM = clean.includes('AM')

  const timePart = clean.replace(/[AP]M/, '').trim()
  const parts = timePart.split(':')
  let hour = parseInt(parts[0], 10) || 0
  const minute = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0

  if (isPM && hour < 12) hour += 12
  if (isAM && hour === 12) hour = 0

  return hour * 60 + minute
}

/**
 * Calculates duration in hours between start and end time
 */
export function calculateDurationHours(startTime: string, endTime: string): number {
  const startMin = parseTimeToMinutes(startTime)
  let endMin = parseTimeToMinutes(endTime)
  if (endMin <= startMin) {
    endMin += 24 * 60 // Next day wraparound
  }
  const diffMinutes = endMin - startMin
  const hours = diffMinutes / 60
  return Math.round(hours * 10) / 10
}

/**
 * Formats duration into human readable string: e.g. "3 hours", "1 hour", "1.5 hours"
 */
export function formatDuration(startTime: string, endTime: string): string {
  const hours = calculateDurationHours(startTime, endTime)
  return hours === 1 ? '1 hour' : `${hours} hours`
}
