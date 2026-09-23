<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { BookingSchedule, PaymentMethod, SitterBookingSummary } from '../../types/booking'
import type { OwnerPet } from '../../types/owner'

const props = defineProps<{
  open: boolean
  schedule: BookingSchedule
  sitter: SitterBookingSummary
  selectedPets: OwnerPet[]
  paymentMethod: PaymentMethod
  totalPrice: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()

function goToBookings() {
  emit('close')
  void router.push('/owner/bookings')
}

function goToHome() {
  emit('close')
  void router.push('/')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
      >
        <div
          class="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
          @click.stop
        >
          <!-- Success Badge -->
          <div class="size-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm border border-emerald-100">
            <svg class="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <!-- Titles -->
          <h3 class="text-2xl font-bold text-[#181A20] tracking-tight">
            Booking Confirmed!
          </h3>
          <p class="text-sm text-[#707687] mt-1.5 leading-relaxed">
            Your booking request has been successfully submitted to the pet sitter.
          </p>

          <!-- Booking Summary Box -->
          <div class="my-6 rounded-2xl bg-[#F8F9FC] p-4 text-left space-y-2.5 text-xs sm:text-sm border border-gray-100">
            <div class="flex justify-between">
              <span class="text-[#82869B] font-medium">Pet Sitter:</span>
              <span class="font-bold text-[#181A20]">{{ sitter.placeName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#82869B] font-medium">Date & Time:</span>
              <span class="font-semibold text-[#181A20]">{{ schedule.formattedDate }} ({{ schedule.startTime }} - {{ schedule.endTime }})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#82869B] font-medium">Pet(s):</span>
              <span class="font-semibold text-[#181A20]">{{ selectedPets.map(p => p.name).join(', ') || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#82869B] font-medium">Payment:</span>
              <span class="font-semibold text-[#FF6433]">{{ paymentMethod === 'credit_card' ? 'Credit Card' : 'Cash (Upon arrival)' }}</span>
            </div>
            <div class="pt-2 border-t border-gray-200/60 flex justify-between text-sm sm:text-base font-bold text-[#181A20]">
              <span>Total Price:</span>
              <span class="text-[#FF6433]">{{ totalPrice }} THB</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <button
              type="button"
              class="w-full py-3.5 rounded-2xl bg-[#FF6433] hover:bg-[#E2480A] text-white font-bold text-sm shadow-md shadow-[#FF6433]/25 transition-all cursor-pointer"
              @click="goToBookings"
            >
              View My Bookings
            </button>
            <button
              type="button"
              class="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#707687] font-semibold text-sm transition-colors cursor-pointer"
              @click="goToHome"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
