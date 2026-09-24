<script setup lang="ts">
import { computed } from 'vue'
import type { BookingSchedule, SitterBookingSummary } from '../../types/booking'
import type { OwnerPet } from '../../types/owner'

const props = defineProps<{
  schedule: BookingSchedule
  durationDisplay: string
  sitter: SitterBookingSummary
  selectedPets: OwnerPet[]
  totalPrice: string
  transactionNo: string
  transactionDate: string
}>()

const emit = defineEmits<{
  (e: 'bookingDetail'): void
  (e: 'backHome'): void
  (e: 'viewMap'): void
}>()

const petNamesDisplay = computed(() => {
  if (!props.selectedPets || props.selectedPets.length === 0) return '-'
  return props.selectedPets.map(p => p.name).join(', ')
})
</script>

<template>
  <div class="relative w-full min-h-[640px] sm:min-h-[720px] flex flex-col items-center justify-center py-10 sm:py-14 px-4 overflow-hidden">
    <!-- DECORATIVE GRAPHIC: TOP-LEFT (Green Arch + Pink Paw) -->
    <div class="pointer-events-none select-none hidden lg:block absolute -top-4 -left-6 xl:left-8 2xl:left-16 z-0">
      <!-- Green Arch / Rainbow -->
      <svg class="w-48 h-28 xl:w-56 xl:h-32 text-[#1EC27C]" viewBox="0 0 160 90" fill="none">
        <path d="M18 82 A62 62 0 0 1 142 82" stroke="currentColor" stroke-width="26" stroke-linecap="round" />
      </svg>
      <!-- Pink Paw -->
      <img
        src="/image/paw-pink.svg"
        alt="Pink Paw"
        class="w-24 h-24 xl:w-28 xl:h-28 -mt-2 ml-14 xl:ml-20 rotate-[-12deg] drop-shadow-sm"
      />
    </div>

    <!-- DECORATIVE GRAPHIC: BOTTOM-RIGHT (Cyan Star + Cat with Yellow Arc) -->
    <div class="pointer-events-none select-none hidden lg:block absolute -bottom-6 -right-6 xl:right-8 2xl:right-16 z-0">
      <!-- 8-pointed Cyan Star -->
      <div class="mb-2 ml-10 xl:ml-16 text-[#64CBFA]">
        <svg class="size-20 xl:size-24" viewBox="0 0 100 100" fill="currentColor">
          <polygon points="50,0 62,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 38,35" />
        </svg>
      </div>
      <!-- Cat with Yellow Arc -->
      <img
        src="/image/cat-arc-yellow.svg"
        alt="Cat Illustration"
        class="w-48 sm:w-56 xl:w-64 h-auto object-contain drop-shadow-md"
      />
    </div>

    <!-- MAIN CARD -->
    <div class="w-full max-w-[540px] xl:max-w-[560px] relative z-10 animate-in zoom-in-95 duration-300">
      <!-- Black Top Header Banner -->
      <div class="bg-black text-white rounded-t-3xl py-7 sm:py-8 px-6 sm:px-8 text-center shadow-sm">
        <h2 class="text-2xl sm:text-[28px] font-bold tracking-tight text-white">
          Thank You For Booking
        </h2>
        <p class="text-xs sm:text-[14px] text-gray-300 mt-2 font-normal">
          We will send your booking information to Pet Sitter.
        </p>
      </div>

      <!-- White Body Card -->
      <div class="bg-white rounded-b-3xl p-6 sm:p-9 shadow-sm border-x border-b border-gray-100 space-y-6">
        <!-- Transaction Metadata -->
        <div class="text-xs sm:text-[13px] text-[#A0A3BD] space-y-1 font-medium">
          <p>Transaction Date: {{ transactionDate }}</p>
          <p>Transaction No. : {{ transactionNo }}</p>
        </div>

        <!-- Pet Sitter -->
        <div>
          <span class="text-xs font-medium text-[#82869B] block mb-1">Pet Sitter:</span>
          <div class="flex items-center justify-between gap-2">
            <p class="text-[15px] font-bold text-[#1E2329]">
              {{ sitter.placeName }} &nbsp;<span class="font-normal text-[#707687]">By {{ sitter.ownerName }}</span>
            </p>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#FF6433] hover:text-[#E2480A] transition-colors cursor-pointer shrink-0"
              @click="emit('viewMap')"
            >
              <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>View Map</span>
            </button>
          </div>
        </div>

        <!-- Date & Time and Duration Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Date & Time -->
          <div>
            <span class="text-xs font-medium text-[#82869B] block mb-1">Date & Time:</span>
            <p class="text-[14.5px] font-bold text-[#1E2329]">
              {{ schedule.formattedDate }} &nbsp;|&nbsp; {{ schedule.startTime }} - {{ schedule.endTime }}
            </p>
          </div>

          <!-- Duration -->
          <div>
            <span class="text-xs font-medium text-[#82869B] block mb-1">Duration:</span>
            <p class="text-[14.5px] font-bold text-[#1E2329]">
              {{ durationDisplay }}
            </p>
          </div>
        </div>

        <!-- Pet -->
        <div>
          <span class="text-xs font-medium text-[#82869B] block mb-1">Pet:</span>
          <p class="text-[14.5px] font-bold text-[#1E2329]">
            {{ petNamesDisplay }}
          </p>
        </div>

        <!-- Divider -->
        <hr class="border-t border-gray-100 my-5" />

        <!-- Total Price -->
        <div class="flex items-center justify-between text-base font-bold text-[#1E2329]">
          <span class="text-[15px]">Total</span>
          <span class="text-[17px] font-bold">{{ totalPrice }} THB</span>
        </div>
      </div>

      <!-- Action Buttons below card -->
      <div class="flex items-center justify-center gap-4 mt-8">
        <button
          type="button"
          class="px-8 py-3 rounded-full bg-[#FFF1EC] hover:bg-[#FFE5DC] text-[#FF6433] font-bold text-sm transition-colors cursor-pointer"
          @click="emit('bookingDetail')"
        >
          Booking Detail
        </button>

        <button
          type="button"
          class="px-8 py-3 rounded-full bg-[#FF6433] hover:bg-[#E2480A] text-white font-bold text-sm transition-all shadow-md shadow-[#FF6433]/20 cursor-pointer"
          @click="emit('backHome')"
        >
          Back To Home
        </button>
      </div>
    </div>
  </div>
</template>
