import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { OwnerBooking } from '../types/owner'

export const useOwnerBookingsStore = defineStore('ownerBookings', () => {
  const bookings = ref<OwnerBooking[]>([
    {
      id: 1,
      sitterName: 'Happy House!',
      sitterOwner: 'Jane Maison',
      sitterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=85',
      status: 'pending',
      startDate: '2025-08-25',
      startTime: '07:00',
      endTime: '10:00',
      durationHours: 3,
      petNames: ['Bubba', 'Daisy'],
      totalPrice: 900,
      transactionNo: '123212',
      transactionDate: 'Tue, 16 Aug 2023',
      bannerText: 'Waiting Pet Sitter confirm booking',
    },
    {
      id: 2,
      sitterName: 'Gentle >< for all pet! (Kid friendly)',
      sitterOwner: 'Jane Maison',
      sitterAvatar: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=100&q=85',
      status: 'in_service',
      startDate: '2025-08-26',
      startTime: '07:00',
      endTime: '10:00',
      durationHours: 3,
      petNames: ['Mr.Ham', 'Bingsu'],
      totalPrice: 1200,
      transactionNo: '123213',
      transactionDate: 'Tue, 14 Aug 2023',
      bannerText: 'Your pet is already in Pet Sitter care!',
    },
    {
      id: 3,
      sitterName: 'We love cat and your cat',
      sitterOwner: 'Jane Maison',
      sitterAvatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=100&q=85',
      status: 'completed',
      startDate: '2025-08-25',
      startTime: '07:00',
      endTime: '10:00',
      durationHours: 3,
      petNames: ['Mr.Ham', 'Bingsu'],
      totalPrice: 800,
      transactionNo: '123214',
      transactionDate: 'Tue, 24 Apr 2023',
      bannerText: '',
      completedAt: 'Tue, 26 Apr 2023 | 11:03 AM',
    },
    {
      id: 4,
      sitterName: 'Happy energetic pup',
      sitterOwner: 'Jane Maison',
      sitterAvatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&q=85',
      status: 'completed',
      startDate: '2025-08-25',
      startTime: '07:00',
      endTime: '10:00',
      durationHours: 3,
      petNames: ['Mr.Ham', 'Bingsu'],
      totalPrice: 950,
      transactionNo: '123215',
      transactionDate: 'Tue, 16 Aug 2023',
      bannerText: '',
      completedAt: 'Tue, 13 Apr 2023 | 8:40 PM',
      review: {
        rating: 5,
        comment: 'Thanks for I Som.',
        createdAt: 'Tue, 13 Apr 2023',
      },
    },
  ])

  function addReview(id: number, rating: number, comment: string) {
    const booking = bookings.value.find(item => item.id === id)
    if (!booking) return
    booking.review = {
      rating,
      comment,
      createdAt: new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
    }
  }

  function addReport(_id: number, _issue: string, _description: string) {
    void _id
    void _issue
    void _description
  }

  return { bookings, addReview, addReport }
})
