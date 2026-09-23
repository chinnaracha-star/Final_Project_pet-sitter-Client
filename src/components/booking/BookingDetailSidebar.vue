<script setup lang="ts">
import { computed } from 'vue'
import type { BookingSchedule, SitterBookingSummary } from '../../types/booking'
import { calculateDurationHours, formatDuration } from '../../types/booking'
import type { OwnerPet } from '../../types/owner'

const props = withDefaults(
  defineProps<{
    schedule: BookingSchedule
    selectedPets: OwnerPet[]
    sitter?: SitterBookingSummary
  }>(),
  {
    sitter: () => ({
      placeName: 'Happy House!',
      ownerName: 'Jane Maison',
      hourlyRate: 200,
    }),
  }
)

// Computed duration in hours
const durationHours = computed(() => {
  return calculateDurationHours(props.schedule.startTime, props.schedule.endTime)
})

const durationDisplay = computed(() => {
  return formatDuration(props.schedule.startTime, props.schedule.endTime)
})

// Selected pet names display (e.g. "-" if none, or "Bubba, Daisy")
const petNamesDisplay = computed(() => {
  if (!props.selectedPets || props.selectedPets.length === 0) {
    return '-'
  }
  return props.selectedPets.map(p => p.name).join(', ')
})

// Calculate total price
const totalPrice = computed(() => {
  const rate = props.sitter?.hourlyRate ?? 200
  // In the design: 3 hours @ 200 THB/hr = 600.00 THB (base hourly rate * duration)
  // When pets are selected, if rate is per hour or per pet per hour:
  // In pet sitting, standard is hourlyRate * duration (or * pet count if multiple)
  // Looking at the Figma screenshot: Duration: 3 hours, Pet: -, Total: 600.00 THB
  // This shows: durationHours * rate (600 THB).
  const hours = Math.max(1, durationHours.value)
  // If user selects multiple pets, price scales with pet count, or base 1 pet
  const total = hours * rate * (props.selectedPets.length > 1 ? props.selectedPets.length : 1)
  return total.toFixed(2)
})
</script>

<template>
  <aside class="w-full lg:w-[360px] xl:w-[380px] shrink-0">
    <div class="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden text-[#1E2329]">
      <!-- Header -->
      <div class="p-6 pb-4 border-b border-gray-100">
        <h3 class="text-lg font-bold text-[#1E2329] tracking-tight">
          Booking Detail
        </h3>
      </div>

      <!-- Detail Rows -->
      <div class="p-6 space-y-5">
        <!-- Pet Sitter -->
        <div>
          <span class="text-xs font-medium text-[#82869B] block mb-1">Pet Sitter:</span>
          <p class="text-[14.5px] font-semibold text-[#1E2329]">
            {{ sitter.placeName }} &nbsp;<span class="text-[#707687] font-normal">By {{ sitter.ownerName }}</span>
          </p>
        </div>

        <!-- Date & Time -->
        <div>
          <span class="text-xs font-medium text-[#82869B] block mb-1">Date & Time:</span>
          <p class="text-[14.5px] font-semibold text-[#1E2329]">
            {{ schedule.formattedDate || 'Select Date' }} &nbsp;|&nbsp; {{ schedule.startTime }} - {{ schedule.endTime }}
          </p>
        </div>

        <!-- Duration -->
        <div>
          <span class="text-xs font-medium text-[#82869B] block mb-1">Duration:</span>
          <p class="text-[14.5px] font-semibold text-[#1E2329]">
            {{ durationDisplay }}
          </p>
        </div>

        <!-- Pet -->
        <div>
          <span class="text-xs font-medium text-[#82869B] block mb-1">Pet:</span>
          <p class="text-[14.5px] font-semibold text-[#1E2329]">
            {{ petNamesDisplay }}
          </p>
        </div>
      </div>

      <!-- Black Total Bar at Bottom -->
      <div class="bg-black text-white px-6 py-4 flex items-center justify-between font-semibold text-[15px]">
        <span>Total</span>
        <span class="text-[17px] font-bold tracking-wide">{{ totalPrice }} THB</span>
      </div>
    </div>
  </aside>
</template>
