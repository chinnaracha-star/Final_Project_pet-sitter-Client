<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
import { getSitterBookings, type SitterBooking } from '../services/sitterBookings'

const bookings = ref<SitterBooking[]>([]), query = ref(''), loading = ref(false), error = ref('')
const labels = { waiting_confirm: 'Waiting for confirm', waiting_service: 'Waiting for service', in_service: 'In service', success: 'Success', cancelled: 'Cancelled' }
async function load() { loading.value = true; error.value = ''; try { bookings.value = await getSitterBookings(query.value) } catch (e) { error.value = e instanceof Error ? e.message : 'Unable to load bookings' } finally { loading.value = false } }
onMounted(load)
</script>

<template><SitterPageShell><main class="page"><div class="heading"><h1>Booking List</h1><form @submit.prevent="load"><input v-model.trim="query" aria-label="Search bookings" placeholder="Search..." /></form></div>
  <p v-if="loading">Loading bookings...</p><p v-else-if="error" class="error">{{ error }}</p><p v-else-if="!bookings.length">No bookings found.</p>
  <div v-else class="table-wrap"><table><thead><tr><th>Date</th><th>Owner name</th><th>Pet</th><th>Booking date</th><th>Status</th></tr></thead><tbody>
    <tr v-for="b in bookings" :key="b.id" @click="$router.push(`/sitter/bookings/${b.id}`)"><td>{{ new Date(b.transactionDate).toLocaleDateString('en-GB') }}</td><td>{{ b.owner.name }}</td><td>{{ b.pets.map(p => p.name).join(', ') || '—' }}</td><td>{{ b.startDate }} · {{ b.startTime.slice(0,5) }}–{{ b.endTime.slice(0,5) }}</td><td><span class="status" :class="b.status">● {{ labels[b.status] }}</span></td></tr>
  </tbody></table></div></main></SitterPageShell></template>

<style scoped>
.page{padding:36px;background:#f7f8fc;min-height:calc(100svh - 78px)}.heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.heading h1{font-size:24px}.heading input{width:240px;border:1px solid #dde0ef;border-radius:8px;padding:10px 14px}.table-wrap{overflow:auto;background:#fff;border-radius:12px}table{width:100%;border-collapse:collapse;min-width:760px}th{background:#111;color:#fff;text-align:left}th,td{padding:16px;border-bottom:1px solid #eef0f7}tbody tr{cursor:pointer}.status{font-size:13px}.waiting_confirm{color:#ee82c1}.waiting_service{color:#ff9c66}.in_service{color:#7ccfff}.success{color:#22c07f}.cancelled,.error{color:#e91010}@media(max-width:760px){.page{padding:20px}.heading{align-items:stretch;flex-direction:column;gap:12px}.heading input{width:100%}}
</style>
