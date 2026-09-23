import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { BookingCustomerInfo, BookingSchedule, CreditCardInfo, PaymentMethod, SitterBookingSummary } from '../types/booking'
import { calculateDurationHours, formatDuration } from '../types/booking'
import type { OwnerPet } from '../types/owner'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'pet_sitter_booking_state'

interface StoredBookingData {
  schedule: BookingSchedule
  sitter: SitterBookingSummary
  selectedPets: OwnerPet[]
  customerInfo?: BookingCustomerInfo
  paymentMethod?: PaymentMethod
  creditCardInfo?: CreditCardInfo
}

function loadInitialState(): StoredBookingData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as StoredBookingData
  } catch {
    // Ignore storage errors
  }
  return null
}

export const useBookingStore = defineStore('booking', () => {
  const initial = loadInitialState()
  const authStore = useAuthStore()

  // Default Schedule: Today's date with next rounded hour
  const defaultDate = new Date()
  const year = defaultDate.getFullYear()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const formattedToday = `${defaultDate.getDate()} ${monthNames[defaultDate.getMonth()]}, ${year}`

  const schedule = ref<BookingSchedule>(
    initial?.schedule ?? {
      date: defaultDate.toISOString().split('T')[0],
      formattedDate: formattedToday,
      startTime: '8:30 AM',
      endTime: '9:30 AM',
    }
  )

  // Sitter Information
  const sitter = ref<SitterBookingSummary>(
    initial?.sitter ?? {
      id: '7f3a9c21-6b84-4d17-a2e9-51c8f0b7436d',
      placeName: 'Happy House!',
      ownerName: 'Jane Maison',
      hourlyRate: 200,
    }
  )

  // Selected Pets for this booking
  const selectedPets = ref<OwnerPet[]>(initial?.selectedPets ?? [])

  // Customer Information (Step 2)
  const customerInfo = ref<BookingCustomerInfo>(
    initial?.customerInfo?.name ? initial.customerInfo : {
      name: authStore.profile?.name || 'Jane Doe',
      email: authStore.profile?.email || 'jane.doe@example.com',
      phone: authStore.profile?.phone || '081-234-5678',
      additionalMessage: 'Please take good care of my pets!',
    }
  )

  // Payment Selection (Step 3)
  const paymentMethod = ref<PaymentMethod>(initial?.paymentMethod ?? 'credit_card')
  const creditCardInfo = ref<CreditCardInfo>(
    initial?.creditCardInfo?.cardNumber ? initial.creditCardInfo : {
      cardNumber: '4111 2222 3333 4444',
      cardOwner: 'Jane Doe',
      expiryDate: '12/28',
      cvv: '123',
    }
  )

  // Auto-persist to sessionStorage
  watch(
    [schedule, sitter, selectedPets, customerInfo, paymentMethod, creditCardInfo],
    () => {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            schedule: schedule.value,
            sitter: sitter.value,
            selectedPets: selectedPets.value,
            customerInfo: customerInfo.value,
            paymentMethod: paymentMethod.value,
            creditCardInfo: creditCardInfo.value,
          })
        )
      } catch {
        // Ignore storage errors
      }
    },
    { deep: true }
  )

  // Computed Duration
  const durationHours = computed(() => {
    return calculateDurationHours(schedule.value.startTime, schedule.value.endTime)
  })

  const durationDisplay = computed(() => {
    return formatDuration(schedule.value.startTime, schedule.value.endTime)
  })

  // Dynamic Total Price: hours * hourlyRate * (number of pets if > 1)
  const totalPrice = computed(() => {
    const rate = sitter.value.hourlyRate || 200
    const hours = Math.max(1, durationHours.value)
    const petCount = selectedPets.value.length > 1 ? selectedPets.value.length : 1
    return (hours * rate * petCount).toFixed(2)
  })

  function setSchedule(newSchedule: BookingSchedule) {
    schedule.value = { ...newSchedule }
  }

  function setSelectedPets(pets: OwnerPet[]) {
    selectedPets.value = [...pets]
  }

  function setCustomerInfo(info: BookingCustomerInfo) {
    customerInfo.value = { ...info }
  }

  function setPaymentMethod(method: PaymentMethod) {
    paymentMethod.value = method
  }

  function setCreditCardInfo(info: CreditCardInfo) {
    creditCardInfo.value = { ...info }
  }

  function setSitter(newSitter: Partial<SitterBookingSummary>) {
    sitter.value = { ...sitter.value, ...newSitter }
  }

  function clearBooking() {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  return {
    schedule,
    sitter,
    selectedPets,
    customerInfo,
    paymentMethod,
    creditCardInfo,
    durationHours,
    durationDisplay,
    totalPrice,
    setSchedule,
    setSitter,
    setSelectedPets,
    setCustomerInfo,
    setPaymentMethod,
    setCreditCardInfo,
    clearBooking,
  }
})

