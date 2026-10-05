import assert from 'node:assert/strict'
import test from 'node:test'
import { canChangeDemoBooking, demoPayoutTransactions } from '../src/services/sitterDemoLogic.ts'

test('demo booking transitions drive payout only after success', () => {
  assert.equal(canChangeDemoBooking('waiting_confirm', 'waiting_service'), true)
  assert.equal(canChangeDemoBooking('waiting_confirm', 'success'), false)
  assert.equal(canChangeDemoBooking('in_service', 'success'), true)

  const bookings = [
    { id: 1, status: 'waiting_service', endDate: '2026-09-22', endTime: '12:00:00', owner: { name: 'John' }, transactionNo: 'MOCK-1', totalPrice: 900 },
    { id: 2, status: 'success', endDate: '2026-09-21', endTime: '13:00:00', owner: { name: 'Jane' }, transactionNo: 'MOCK-2', totalPrice: 1500 },
  ]
  assert.deepEqual(demoPayoutTransactions(bookings).map(item => item.bookingId), [2])
  bookings[0].status = 'success'
  assert.equal(demoPayoutTransactions(bookings).reduce((sum, item) => sum + item.amount, 0), 2400)
})
