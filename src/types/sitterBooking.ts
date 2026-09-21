export type SitterBookingStatus =
  | 'waiting_confirm'
  | 'waiting_service'
  | 'in_service'
  | 'success'
  | 'cancelled'

export interface SitterBooking {
  id: number
  ownerName: string
  ownerAvatar: string
  petCount: number
  durationLabel: string
  bookedDateLabel: string
  status: SitterBookingStatus
  hasNewBooking: boolean
}

export const SITTER_BOOKING_STATUS_LABEL: Record<SitterBookingStatus, string> = {
  waiting_confirm: 'Waiting for confirm',
  waiting_service: 'Waiting for service',
  in_service: 'In service',
  success: 'Success',
  cancelled: 'Cancelled',
}

export const SITTER_BOOKING_STATUS_CLASS: Record<SitterBookingStatus, string> = {
  waiting_confirm: 'text-pink-500',
  waiting_service: 'text-yellow-500',
  in_service: 'text-blue-500',
  success: 'text-green-500',
  cancelled: 'text-red',
}
