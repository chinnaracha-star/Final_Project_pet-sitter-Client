<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Navbar } from '../components'
import BookingCard from '../components/owner/BookingCard.vue'
import BookingDetailModal from '../components/owner/BookingDetailModal.vue'
import ChangeScheduleModal from '../components/owner/ChangeScheduleModal.vue'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import ReportModal from '../components/owner/ReportModal.vue'
import ReviewModal from '../components/owner/ReviewModal.vue'
import YourReviewModal from '../components/owner/YourReviewModal.vue'
import { useOwnerBookingsStore } from '../stores/ownerBookings'
import type { OwnerBooking } from '../types/owner'

const bookings = useOwnerBookingsStore()
const router = useRouter()
const selected = ref<OwnerBooking | null>(null)
const detailOpen = ref(false)
const reportOpen = ref(false)
const reviewOpen = ref(false)
const yourReviewOpen = ref(false)
const changeOpen = ref(false)
const notice = ref('')

onMounted(() => {
  void bookings.load()
})

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

function openChange(booking: OwnerBooking) {
  selected.value = booking
  changeOpen.value = true
}

function showError(cause: unknown) {
  notice.value = cause instanceof Error ? cause.message : 'Request failed'
}

async function submitReport(issue: string, description: string) {
  if (!selected.value) return
  try {
    await bookings.addReport(selected.value.id, issue, description)
    reportOpen.value = false
    notice.value = 'Report sent.'
  } catch (cause) {
    showError(cause)
  }
}

async function submitReview(rating: number, comment: string) {
  if (!selected.value) return
  try {
    await bookings.addReview(selected.value.id, rating, comment)
    reviewOpen.value = false
    notice.value = 'Review sent.'
  } catch (cause) {
    showError(cause)
  }
}

async function submitChange(schedule: { startDate: string; endDate: string; startTime: string; endTime: string }) {
  if (!selected.value) return
  try {
    await bookings.changeSchedule(selected.value.id, schedule)
    selected.value = bookings.bookings.find(item => item.id === selected.value?.id) || selected.value
    changeOpen.value = false
    notice.value = 'Schedule updated.'
  } catch (cause) {
    showError(cause)
  }
}

function viewSitter() {
  if (!selected.value) return
  void router.push(`/sitters/${selected.value.sitterId}`)
}
</script>

<template>
  <OwnerPageShell title="Booking History">
    <template #nav>
      <Navbar />
    </template>

    <p v-if="bookings.error || notice" class="mb-6 auth-notice" role="status">{{ bookings.error || notice }}</p>
    <p v-if="bookings.loading" class="text-primary-500">Loading booking history...</p>
    <p v-else-if="!bookings.error && bookings.bookings.length === 0" class="text-primary-500">No bookings yet.</p>
    <div v-else class="space-y-5">
      <BookingCard
        v-for="booking in bookings.bookings"
        :key="booking.id"
        :booking="booking"
        @open="openDetail(booking)"
        @report="openReport(booking)"
        @review="openReview(booking)"
        @your-review="openYourReview(booking)"
        @change="openChange(booking)"
      />
    </div>

    <BookingDetailModal :open="detailOpen" :booking="selected" @close="detailOpen = false" />
    <ChangeScheduleModal :open="changeOpen" :booking="selected" @close="changeOpen = false" @submit="submitChange" />
    <ReportModal :open="reportOpen" @close="reportOpen = false" @submit="submitReport" />
    <ReviewModal :open="reviewOpen" @close="reviewOpen = false" @submit="submitReview" />
    <YourReviewModal
      :open="yourReviewOpen"
      :booking="selected"
      @close="yourReviewOpen = false"
      @view-sitter="viewSitter"
    />
  </OwnerPageShell>
</template>
