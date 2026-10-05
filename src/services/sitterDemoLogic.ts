import type { BookingStatus, SitterBooking } from './sitterBookings'

export function canChangeDemoBooking(current: BookingStatus, next: 'waiting_service' | 'cancelled' | 'success') {
  return (current === 'waiting_confirm' && (next === 'waiting_service' || next === 'cancelled'))
    || (current === 'in_service' && next === 'success')
}

export function demoPayoutTransactions(bookings: SitterBooking[]) {
  return bookings.filter(booking => booking.status === 'success')
    .map(booking => ({
      bookingId: booking.id,
      completedAt: `${booking.endDate}T${booking.endTime}+07:00`,
      ownerName: booking.owner.name,
      transactionNo: booking.transactionNo,
      amount: booking.totalPrice,
    }))
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}
