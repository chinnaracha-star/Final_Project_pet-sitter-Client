<script setup lang="ts">
import { ref } from 'vue'
import { Navbar } from '../components'
import BookingCard from '../components/owner/BookingCard.vue'
import BookingDetailModal from '../components/owner/BookingDetailModal.vue'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import ReportModal from '../components/owner/ReportModal.vue'
import ReviewModal from '../components/owner/ReviewModal.vue'
import YourReviewModal from '../components/owner/YourReviewModal.vue'
import { useOwnerBookingsStore } from '../stores/ownerBookings'
import type { OwnerBooking } from '../types/owner'

const bookings = useOwnerBookingsStore()
const selected = ref<OwnerBooking | null>(null)
const detailOpen = ref(false)
const reportOpen = ref(false)
const reviewOpen = ref(false)
const yourReviewOpen = ref(false)
const notice = ref('')

function openDetail(booking: OwnerBooking) {
  selected.value = booking
  detailOpen.value = true
}

function openReport(booking: OwnerBooking) {
  selected.value = booking
  reportOpen.value = true
}

function openReview(booking: OwnerBooking) {
  selected.value = booking
  reviewOpen.value = true
}

function openYourReview(booking: OwnerBooking) {
  selected.value = booking
  yourReviewOpen.value = true
}

function mock(action: string) {
  notice.value = `${action} is mock-only until the Spring Boot API is connected.`
}

function submitReport(issue: string, description: string) {
  if (!selected.value) return
  bookings.addReport(selected.value.id, issue, description)
  reportOpen.value = false
  notice.value = 'Report saved in this mock session.'
}

function submitReview(rating: number, comment: string) {
  if (!selected.value) return
  bookings.addReview(selected.value.id, rating, comment)
  reviewOpen.value = false
  notice.value = 'Review saved in this mock session.'
}
</script>

<template>
  <OwnerPageShell title="Booking History">
    <template #nav>
      <Navbar />
    </template>

    <p v-if="notice" class="mb-6 auth-notice" role="status">{{ notice }}</p>
    <div class="space-y-5">
      <BookingCard
        v-for="booking in bookings.bookings"
        :key="booking.id"
        :booking="booking"
        @open="openDetail(booking)"
        @report="openReport(booking)"
        @review="openReview(booking)"
        @your-review="openYourReview(booking)"
        @mock="mock"
      />
    </div>

    <BookingDetailModal :open="detailOpen" :booking="selected" @close="detailOpen = false" @mock="mock" />
    <ReportModal :open="reportOpen" @close="reportOpen = false" @submit="submitReport" />
    <ReviewModal :open="reviewOpen" @close="reviewOpen = false" @submit="submitReview" />
    <YourReviewModal
      :open="yourReviewOpen"
      :booking="selected"
      @close="yourReviewOpen = false"
      @mock="mock('View Pet Sitter')"
    />
  </OwnerPageShell>
</template>
