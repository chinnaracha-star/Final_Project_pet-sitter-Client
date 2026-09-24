<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BookingListTable from '../components/sitter/BookingListTable.vue'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
import { getSitterBookings } from '../services/sitterBookings'
import { useSitterBookingsStore } from '../stores/sitterBookings'

const bookings = useSitterBookingsStore()
const error = ref('')
const loading = ref(true)
onMounted(async () => {
  try { bookings.bookings = await getSitterBookings() }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Unable to load bookings' }
  finally { loading.value = false }
})
</script>

<template>
  <SitterPageShell>
    <main class="px-6 py-8 sm:px-8">
      <p v-if="error" class="mb-4 text-red" role="alert">{{ error }}</p>
      <p v-if="loading" class="text-primary-500" role="status">Loading bookings...</p>
      <BookingListTable v-else />
    </main>
  </SitterPageShell>
</template>
