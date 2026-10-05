<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BookingListTable from '../components/sitter/BookingListTable.vue'
import SitterDemoNotice from '../components/sitter/SitterDemoNotice.vue'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
import { getSitterBookings } from '../services/sitterBookings'
import { isSitterDemo } from '../services/sitterDemo'
import { useSitterBookingsStore } from '../stores/sitterBookings'

const bookings = useSitterBookingsStore()
const error = ref('')
onMounted(async () => {
  if (isSitterDemo()) return
  try { bookings.bookings = await getSitterBookings() }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Unable to load bookings' }
})
</script>

<template>
  <SitterPageShell>
    <main class="px-6 py-8 sm:px-8">
      <SitterDemoNotice />
      <p v-if="error" class="mb-4 text-red" role="alert">{{ error }}</p>
      <BookingListTable />
    </main>
  </SitterPageShell>
</template>
