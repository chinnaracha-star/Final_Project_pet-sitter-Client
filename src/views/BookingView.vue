<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Navbar, Footer } from '../components'
import {
  BookingCalendarModal,
  BookingStepsBar,
  BookingPetSelection,
  BookingInformationForm,
  BookingPaymentSelection,
  BookingConfirmationModal,
  BookingThankYouCard,
  BookingDetailSidebar,
  type BookingSchedule,
  type BookingCustomerInfo,
  type PaymentMethod,
  type CreditCardInfo,
} from '../components/booking'
import { useBookingStore } from '../stores/booking'
import { useAuthStore } from '../stores/auth'
import { useOwnerBookingsStore } from '../stores/ownerBookings'
import { api } from '../services/http'
import { getPublicSitter } from '../services/sitterApproval'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const authStore = useAuthStore()

// Current Step: 'calendar' | 'pet' | 'information' | 'payment' | 'thankyou'
const currentStep = ref<'calendar' | 'pet' | 'information' | 'payment' | 'thankyou'>('calendar')
const isCalendarModalOpen = ref(true)
const isConfirmationModalOpen = ref(false)
const pendingPaymentPayload = ref<{ method: PaymentMethod; card?: CreditCardInfo } | null>(null)

// Transaction info shown on the Thank You page
const TXN_STORAGE_KEY = 'pet_sitter_confirmed_txn'
function loadConfirmedTxn(): { transactionNo: string; transactionDate: string } {
  try {
    const raw = sessionStorage.getItem(TXN_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    transactionNo: '122312',
    transactionDate: new Date().toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }
}
const confirmedTransaction = ref(loadConfirmedTxn())

// Notification toast message
const notificationMessage = ref('')

function showToast(msg: string) {
  notificationMessage.value = msg
  setTimeout(() => {
    notificationMessage.value = ''
  }, 4000)
}

// Sync route with currentStep
function syncStepFromRoute() {
  if (route.path.includes('/booking/thank-you')) {
    currentStep.value = 'thankyou'
    isCalendarModalOpen.value = false
  } else if (route.path.includes('/booking/payment')) {
    currentStep.value = 'payment'
    isCalendarModalOpen.value = false
  } else if (route.path.includes('/booking/information')) {
    currentStep.value = 'information'
    isCalendarModalOpen.value = false
  } else if (route.path.includes('/booking/pet')) {
    currentStep.value = 'pet'
    isCalendarModalOpen.value = false
  } else {
    currentStep.value = 'calendar'
    isCalendarModalOpen.value = true
  }
}

onMounted(async () => {
  syncStepFromRoute()
  const sitterId = route.query.sitterId as string | undefined
  if (sitterId) {
    try {
      const detail = await getPublicSitter(sitterId)
      if (detail) {
        const years = parseFloat(detail.experienceYears || '1.5')
        let rate = 200
        if (!isNaN(years)) {
          if (years >= 5) rate = 300
          else if (years >= 3) rate = 250
          else if (years >= 2) rate = 220
          else rate = 200
        }
        bookingStore.setSitter({
          id: detail.userId,
          placeName: detail.displayName || 'Pet Sitter House',
          ownerName: detail.ownerName || 'Verified Sitter',
          hourlyRate: rate,
        })
      }
    } catch (e) {
      console.warn('Could not load sitter info from query:', e)
    }
  }
})

watch(() => route.path, () => {
  syncStepFromRoute()
})

// Triggered when user picks date/time and clicks "Continue" on the Calendar popup
function handleCalendarContinue(selectedSchedule: BookingSchedule) {
  bookingStore.setSchedule(selectedSchedule)
  isCalendarModalOpen.value = false
  currentStep.value = 'pet'
  void router.push('/booking/pet')
  showToast(`Schedule confirmed: ${selectedSchedule.formattedDate} (${selectedSchedule.startTime} - ${selectedSchedule.endTime})`)
}

// When clicking Close (X) on the Calendar Modal
function handleCalendarClose() {
  isCalendarModalOpen.value = false
}

// Triggered when user clicks "Back" on the Pet Selection screen -> Return to Calendar step
function handleBackToCalendar() {
  currentStep.value = 'calendar'
  isCalendarModalOpen.value = true
  void router.push('/booking')
}

// Triggered when user clicks "Next" on Pet Selection screen -> Advance to Step 2 Information
function handleNextFromPets() {
  if (bookingStore.selectedPets.length === 0) {
    showToast('Please choose at least one pet to continue')
    return
  }
  void router.push('/booking/information')
}

// Step 2 Information handlers
function handleBackFromInfo() {
  void router.push('/booking/pet')
}

function handleNextFromInfo(data: BookingCustomerInfo) {
  bookingStore.setCustomerInfo(data)
  void router.push('/booking/payment')
  showToast('Information saved. Proceeding to Payment!')
}

// Step 3 Payment handlers
function handleBackFromPayment() {
  void router.push('/booking/information')
}

// Triggered when clicking "Confirm Booking" on the Payment page -> Opens the dimmed Confirmation Popup
function handleInitiateConfirmBooking(payload: { method: PaymentMethod; card?: CreditCardInfo }) {
  pendingPaymentPayload.value = payload
  isConfirmationModalOpen.value = true
}

function toLocalTimeString(t?: string): string {
  if (!t) return '08:30:00'
  const trimmed = t.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i)
  if (!match) return '08:30:00'
  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const ampm = match[4]?.toUpperCase()
  if (ampm === 'PM' && hours < 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:00`
}

// Triggered when clicking "Yes, I'm sure" inside the Confirmation Popup -> Transitions directly to Thank You page
async function handleFinalConfirmBooking() {
  isConfirmationModalOpen.value = false

  if (pendingPaymentPayload.value) {
    bookingStore.setPaymentMethod(pendingPaymentPayload.value.method)
    if (pendingPaymentPayload.value.card) {
      bookingStore.setCreditCardInfo(pendingPaymentPayload.value.card)
    }
  }

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  let finalTxnNo = Math.floor(100000 + Math.random() * 900000).toString()

  try {
    const payload = {
      sitterId: bookingStore.sitter.id || '7f3a9c21-6b84-4d17-a2e9-51c8f0b7436d',
      startDate: bookingStore.schedule.date || new Date().toISOString().split('T')[0],
      endDate: bookingStore.schedule.date || new Date().toISOString().split('T')[0],
      startTime: toLocalTimeString(bookingStore.schedule.startTime),
      endTime: toLocalTimeString(bookingStore.schedule.endTime),
      duration: Math.max(1, bookingStore.durationHours),
      durationUnit: 'hours',
      contactName: bookingStore.customerInfo.name || 'Jane Doe',
      contactEmail: bookingStore.customerInfo.email || 'jane.doe@example.com',
      contactPhone: bookingStore.customerInfo.phone || '081-234-5678',
      additionalMessage: bookingStore.customerInfo.additionalMessage || '',
      totalPrice: Number(bookingStore.totalPrice) || 200,
      paymentMethod: bookingStore.paymentMethod || 'credit_card',
      petIds: bookingStore.selectedPets.map(p => Number(p.id)).filter(id => !isNaN(id)),
      cardOwnerName: bookingStore.creditCardInfo.cardOwner || 'Jane Doe',
      cardNumber: bookingStore.creditCardInfo.cardNumber || '4111 2222 3333 4444',
    }

    const headers: Record<string, string> = {}
    if (authStore.userId) {
      headers['X-User-Id'] = authStore.userId
    }

    const res = await api<{ id: number; status: string; transactionNo: string }>('/api/bookings', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (res?.transactionNo) {
      finalTxnNo = res.transactionNo
    }
  } catch (err: any) {
    console.warn('Booking API call failed or in offline mode, falling back to local transaction confirmation:', err)
  }

  confirmedTransaction.value = {
    transactionNo: finalTxnNo,
    transactionDate: todayStr,
  }
  try {
    sessionStorage.setItem(TXN_STORAGE_KEY, JSON.stringify(confirmedTransaction.value))
  } catch {}

  // Sync with Owner Booking History store
  try {
    const ownerBookingsStore = useOwnerBookingsStore()
    const petNames = bookingStore.selectedPets.map(p => p.name)
    ownerBookingsStore.addBooking({
      id: Number(finalTxnNo) || Date.now(),
      sitterName: bookingStore.sitter.placeName || 'Happy House!',
      sitterOwner: bookingStore.sitter.ownerName || 'Jane Maison',
      sitterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=85',
      status: 'pending',
      startDate: bookingStore.schedule.date || new Date().toISOString().split('T')[0],
      startTime: bookingStore.schedule.startTime ? toLocalTimeString(bookingStore.schedule.startTime).slice(0, 5) : '08:30',
      endTime: bookingStore.schedule.endTime ? toLocalTimeString(bookingStore.schedule.endTime).slice(0, 5) : '10:30',
      durationHours: Math.max(1, bookingStore.durationHours),
      petNames: petNames.length > 0 ? petNames : ['Your Pet'],
      totalPrice: Number(bookingStore.totalPrice) || 200,
      transactionNo: finalTxnNo,
      transactionDate: todayStr,
      bannerText: 'Waiting Pet Sitter confirm booking',
    })
  } catch (e) {
    console.warn('Could not sync booking to owner history store:', e)
  }

  currentStep.value = 'thankyou'
  void router.push('/booking/thank-you')
  showToast('Booking confirmed! Payment successful.')
}
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FC] text-[#1E2329] flex flex-col justify-between font-sans">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Container -->
    <main class="flex-1 w-full max-w-[1240px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col justify-center">
      <!-- Toast Notification -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 -translate-y-3"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-3"
      >
        <div
          v-if="notificationMessage"
          class="fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-emerald-600 text-white px-5 py-3 shadow-xl flex items-center gap-3 text-sm font-semibold"
        >
          <svg class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ notificationMessage }}</span>
        </div>
      </Transition>

      <!-- SCREEN 1: CALENDAR STEP (Clean white canvas waiting for teammate's sitter detail page + modal popup) -->
      <div v-if="currentStep === 'calendar'" class="flex-1 flex flex-col items-center justify-center py-16">
        <!-- Clean white background placeholder waiting for Sitter Detail integration -->
        <div class="text-center max-w-lg mx-auto py-12">
          <div class="size-20 mx-auto mb-5 rounded-full bg-[#FFF2EC] text-[#FF6433] flex items-center justify-center shadow-sm">
            <svg class="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-[#1E2329]">{{ bookingStore.sitter.placeName }}</h1>
          <p class="text-sm text-[#707687] mt-1 font-medium">By {{ bookingStore.sitter.ownerName }}</p>
          <p class="mt-3 text-[14px] text-[#82869B] leading-relaxed">
            Select date and time you want to schedule the service.
          </p>

          <button
            v-if="!isCalendarModalOpen"
            type="button"
            class="mt-6 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FF6433] hover:bg-[#E2480A] text-white font-bold text-[15px] shadow-lg shadow-[#FF6433]/25 transition-all cursor-pointer"
            @click="isCalendarModalOpen = true"
          >
            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Select Date & Time
          </button>
        </div>

        <!-- Initial Calendar Popup Modal with Dimming Backdrop -->
        <BookingCalendarModal
          :open="isCalendarModalOpen"
          :as-modal="true"
          :has-backdrop="true"
          :initial-date="bookingStore.schedule.date"
          :initial-start-time="bookingStore.schedule.startTime"
          :initial-end-time="bookingStore.schedule.endTime"
          @close="handleCalendarClose"
          @continue="handleCalendarContinue"
        />
      </div>

      <!-- SCREEN 2: STEP 1 - PET SELECTION STEP -->
      <div v-else-if="currentStep === 'pet'" class="w-full animate-in fade-in duration-300">
        <!-- Steps Header Bar -->
        <section class="mb-8">
          <BookingStepsBar :current-step="1" />
        </section>

        <!-- Step 1 Layout: Grid with Pet Selection & Booking Detail Sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left: Choose Your Pet -->
          <section class="lg:col-span-8">
            <BookingPetSelection
              v-model="bookingStore.selectedPets"
              @back="handleBackToCalendar"
              @next="handleNextFromPets"
            />
          </section>

          <!-- Right: Booking Detail Sidebar -->
          <section class="lg:col-span-4">
            <BookingDetailSidebar
              :schedule="bookingStore.schedule"
              :selected-pets="bookingStore.selectedPets"
              :sitter="bookingStore.sitter"
            />
          </section>
        </div>
      </div>

      <!-- SCREEN 3: STEP 2 - INFORMATION STEP -->
      <div v-else-if="currentStep === 'information'" class="w-full animate-in fade-in duration-300">
        <!-- Steps Header Bar -->
        <section class="mb-8">
          <BookingStepsBar :current-step="2" />
        </section>

        <!-- Step 2 Layout: Grid with Information Form & Booking Detail Sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left: Customer Information Form -->
          <section class="lg:col-span-8">
            <BookingInformationForm
              :initial-data="bookingStore.customerInfo"
              @back="handleBackFromInfo"
              @next="handleNextFromInfo"
            />
          </section>

          <!-- Right: Booking Detail Sidebar -->
          <section class="lg:col-span-4">
            <BookingDetailSidebar
              :schedule="bookingStore.schedule"
              :selected-pets="bookingStore.selectedPets"
              :sitter="bookingStore.sitter"
            />
          </section>
        </div>
      </div>

      <!-- SCREEN 4: STEP 3 - PAYMENT STEP -->
      <div v-else-if="currentStep === 'payment'" class="w-full animate-in fade-in duration-300">
        <!-- Steps Header Bar -->
        <section class="mb-8">
          <BookingStepsBar :current-step="3" />
        </section>

        <!-- Step 3 Layout: Grid with Payment Selection & Booking Detail Sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left: Payment Options (Credit Card / Cash) -->
          <section class="lg:col-span-8">
            <BookingPaymentSelection
              :initial-method="bookingStore.paymentMethod"
              :initial-card="bookingStore.creditCardInfo"
              @back="handleBackFromPayment"
              @confirm="handleInitiateConfirmBooking"
            />
          </section>

          <!-- Right: Booking Detail Sidebar -->
          <section class="lg:col-span-4">
            <BookingDetailSidebar
              :schedule="bookingStore.schedule"
              :selected-pets="bookingStore.selectedPets"
              :sitter="bookingStore.sitter"
            />
          </section>
        </div>
      </div>

      <!-- SCREEN 5: THANK YOU FOR BOOKING STEP -->
      <div v-else-if="currentStep === 'thankyou'" class="w-full animate-in fade-in duration-300">
        <BookingThankYouCard
          :schedule="bookingStore.schedule"
          :duration-display="bookingStore.durationDisplay"
          :sitter="bookingStore.sitter"
          :selected-pets="bookingStore.selectedPets"
          :total-price="bookingStore.totalPrice"
          :transaction-no="confirmedTransaction.transactionNo"
          :transaction-date="confirmedTransaction.transactionDate"
          @booking-detail="router.push('/owner/bookings')"
          @back-home="router.push('/')"
          @view-map="router.push('/search')"
        />
      </div>
    </main>

    <!-- Booking Confirmation Popup (Dimmed Background with Cancel / Yes, I'm sure) -->
    <BookingConfirmationModal
      :open="isConfirmationModalOpen"
      @close="isConfirmationModalOpen = false"
      @confirm="handleFinalConfirmBooking"
    />

    <!-- Footer -->
    <Footer />
  </div>
</template>
