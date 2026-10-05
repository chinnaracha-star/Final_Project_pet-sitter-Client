<script setup lang="ts">
import { ref, watch } from 'vue'
import type { OwnerBooking } from '../../types/owner'
import OwnerModal from './OwnerModal.vue'

const props = defineProps<{
  open: boolean
  booking: OwnerBooking | null
}>()

const emit = defineEmits<{
  close: []
  submit: [schedule: { startDate: string; endDate: string; startTime: string; endTime: string }]
}>()

const startDate = ref('')
const endDate = ref('')
const startTime = ref('')
const endTime = ref('')

watch(() => props.open, open => {
  if (!open || !props.booking) return
  startDate.value = props.booking.startDate
  endDate.value = props.booking.endDate
  startTime.value = props.booking.startTime.slice(0, 5)
  endTime.value = props.booking.endTime.slice(0, 5)
})

function send() {
  emit('submit', {
    startDate: startDate.value,
    endDate: endDate.value,
    startTime: startTime.value,
    endTime: endTime.value,
  })
}
</script>

<template>
  <OwnerModal :open="open" @close="emit('close')">
    <form @submit.prevent="send">
      <div class="flex flex-nowrap items-center justify-between gap-4 border-b border-primary-100 pb-4">
        <h2 class="text-xl font-bold leading-none">Change Schedule</h2>
        <button type="button" class="inline-flex size-10 shrink-0 items-center justify-center text-primary-900" aria-label="Close" @click="emit('close')">
          <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <label class="block text-sm font-bold">Start date<input v-model="startDate" class="auth-input mt-2 rounded-lg!" type="date" required /></label>
        <label class="block text-sm font-bold">End date<input v-model="endDate" class="auth-input mt-2 rounded-lg!" type="date" required /></label>
        <label class="block text-sm font-bold">Start time<input v-model="startTime" class="auth-input mt-2 rounded-lg!" type="time" required /></label>
        <label class="block text-sm font-bold">End time<input v-model="endTime" class="auth-input mt-2 rounded-lg!" type="time" required /></label>
      </div>
      <div class="mt-8 flex items-center justify-between gap-3">
        <button type="button" class="min-h-12 rounded-full bg-orange-100 px-8 font-bold text-orange-700" @click="emit('close')">Cancel</button>
        <button class="auth-submit w-auto px-8 whitespace-nowrap" type="submit">Save</button>
      </div>
    </form>
  </OwnerModal>
</template>
