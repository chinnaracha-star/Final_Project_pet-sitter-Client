<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import AdminSidebar from '../../components/AdminSidebar.vue'
import AdminPetSitterViewBookingDetail from './AdminPetSitterView-Booking-Detail.vue'
import { useAdminPetSitterStore } from '../../stores/adminPetSitter'
import { API_BASE_URL } from '../../config/api'

const store = useAdminPetSitterStore()
const route = useRoute()

type BookingStatus = 'Waiting for confirm' | 'Waiting for service' | 'In service' | 'Success' | 'Canceled'

interface PetDetail {
	name: string
	type: string
	image: string
}

interface Booking {
	ownerName: string
	petCount: number
	duration: string
	bookedDate: string
	status: BookingStatus
	pets: PetDetail[]
	totalPaid: string
}

// raw shape returned by GET /api/bookings/sitter/{sitterId} (bookings joined with users, booking_pets and pets)
interface BookingAdminPetItem {
	id: number
	name: string | null
	type: string | null
	avatarUrl: string | null
}

interface BookingAdminListItem {
	id: number
	ownerName: string | null
	totalPrice: number
	duration: number
	durationUnit: string
	startDate: string
	startTime: string
	endDate: string
	endTime: string
	status: string
	pets: BookingAdminPetItem[]
}

const statusClass: Record<BookingStatus, string> = {
	'Waiting for confirm': 'text-[#ef82b6]',
	'Waiting for service': 'text-[#f6ad2f]',
	'In service': 'text-[#57b7ef]',
	Success: 'text-[#16c98d]',
	Canceled: 'text-[#ff4242]',
}

const statusLabel: Record<string, BookingStatus> = {
	waiting_confirm: 'Waiting for confirm',
	waiting_service: 'Waiting for service',
	in_service: 'In service',
	success: 'Success',
	canceled: 'Canceled',
}

const bookings = ref<Booking[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const formatBookedDate = (startDate: string, startTime: string) => {
	const date = new Date(`${startDate}T${startTime}`)
	if (Number.isNaN(date.getTime())) return `${startDate}, ${startTime}`
	const day = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
	const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '')
	return `${day}, ${time}`
}

const mapBooking = (item: BookingAdminListItem): Booking => ({
	ownerName: item.ownerName ?? 'Unknown',
	petCount: item.pets.length,
	duration: `${item.duration} ${item.durationUnit}`,
	bookedDate: formatBookedDate(item.startDate, item.startTime),
	status: statusLabel[item.status] ?? 'Waiting for confirm',
	pets: item.pets.map((pet) => ({ name: pet.name ?? 'Unknown', type: pet.type ?? 'Pet', image: pet.avatarUrl ?? '' })),
	totalPaid: `${item.totalPrice.toFixed(2)} THB`,
})

const fetchBookings = async (sitterId: string) => {
	isLoading.value = true
	errorMessage.value = ''
	try {
		const response = await axios.get<BookingAdminListItem[]>(`${API_BASE_URL}/bookings/admin/sitter/${sitterId}`)
		bookings.value = response.data.map(mapBooking)
	} catch (error) {
		console.error('Failed to fetch sitter bookings:', error)
		errorMessage.value = 'Unable to load bookings.'
	} finally {
		isLoading.value = false
	}
}

const selectedBooking = ref<Booking | null>(null)

// fall back to the userId in the URL (e.g. after a page refresh) when the store hasn't been populated yet
onMounted(() => {
	const queryId = route.query.id
	if (!store.selectedSitterId && typeof queryId === 'string') {
		store.selectedSitterId = queryId
	}
	if (store.selectedSitterId) fetchBookings(store.selectedSitterId)
})

watch(
	() => store.selectedSitterId,
	(id) => {
		if (id) fetchBookings(id)
	},
)
</script>

<template>
	<div class="flex min-h-screen bg-[#f7f8fc] text-[#30343f]">
		<AdminSidebar />

		<main class="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-7">
			<div class="mx-auto max-w-[1000px]">
				<header class="flex flex-wrap items-center justify-between gap-4 px-1">
					<div class="flex min-w-0 items-center gap-3">
						<RouterLink to="/admin/petsitters" class="text-xl leading-none text-[#9298ab]" aria-label="Back to pet sitters">‹</RouterLink>
						<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ store.selectedSitterName ?? 'Jane Maison' }}</h1>
						<span class="flex shrink-0 items-center gap-1.5 text-[10px] text-[#1ac88d]">
							<span class="h-1 w-1 rounded-full bg-current"></span>
							{{ store.selectedSitterStatus ?? 'Approved' }}
						</span>
					</div>
				</header>

				<nav class="mt-4 flex gap-2" aria-label="Sitter profile sections">
					<RouterLink
						:to="{ path: '/admin/petsitters/profile', query: { id: store.selectedSitterId ?? undefined } }"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="store.activeTab === 'Profile' ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="store.activeTab = 'Profile'"
					>
						Profile
					</RouterLink>
					<RouterLink
						:to="{ path: '/admin/petsitters/profile/booking', query: { id: store.selectedSitterId ?? undefined } }"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="store.activeTab === 'Booking' ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="store.activeTab = 'Booking'"
					>
						Booking
					</RouterLink>
					<RouterLink
						:to="{ path: '/admin/petsitters/profile/reviews', query: { id: store.selectedSitterId ?? undefined } }"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="store.activeTab === 'Reviews' ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="store.activeTab = 'Reviews'"
					>
						Reviews
					</RouterLink>
				</nav>

				<section class="mt-0 overflow-hidden rounded-xl bg-white px-5 py-6 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:px-6 sm:py-6">
					<p v-if="isLoading" class="px-1 py-4 text-[11px] text-[#858b9f]">Loading bookings…</p>
					<p v-else-if="errorMessage" class="px-1 py-4 text-[11px] text-[#ff4242]">{{ errorMessage }}</p>
					<p v-else-if="bookings.length === 0" class="px-1 py-4 text-[11px] text-[#858b9f]">No bookings found.</p>
					<div v-else class="overflow-x-auto">
						<table class="w-full min-w-[680px] table-fixed border-collapse text-left text-[10px] text-[#16181d]">
							<caption class="sr-only">Booking records for {{ store.selectedSitterName ?? 'the selected pet sitter' }}</caption>
							<colgroup>
								<col class="w-[23%]" />
								<col class="w-[12%]" />
								<col class="w-[14%]" />
								<col class="w-[32%]" />
								<col class="w-[19%]" />
							</colgroup>
							<thead>
								<tr class="bg-black text-[9px] font-medium text-white">
									<th class="rounded-l-lg px-3 py-2.5 font-medium">Pet Owner Name</th>
									<th class="px-3 py-2.5 font-medium">Pet(s)</th>
									<th class="px-3 py-2.5 font-medium">Duration</th>
									<th class="px-3 py-2.5 font-medium">Booked Date</th>
									<th class="rounded-r-lg px-3 py-2.5 font-medium">Status</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="booking in bookings"
									:key="`${booking.ownerName}-${booking.bookedDate}`"
									class="cursor-pointer border-b border-[#e5e8f0] last:border-b-0 hover:bg-[#f7f8fc]"
									@click="selectedBooking = booking"
								>
									<td class="px-3 py-[15px] font-medium">
										<span v-if="booking.status === 'Waiting for confirm'" class="mr-2 inline-block h-1 w-1 rounded-full bg-[#ff7040] align-middle"></span>
										{{ booking.ownerName }}
									</td>
									<td class="px-3 py-[15px]">{{ booking.petCount }}</td>
									<td class="px-3 py-[15px]">{{ booking.duration }}</td>
									<td class="whitespace-nowrap px-3 py-[15px]">{{ booking.bookedDate }}</td>
									<td class="whitespace-nowrap px-3 py-[15px]" :class="statusClass[booking.status]">
										<span class="mr-1 inline-block h-1 w-1 rounded-full bg-current align-middle"></span>{{ booking.status }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</main>

		<AdminPetSitterViewBookingDetail
			v-if="selectedBooking"
			:owner-name="selectedBooking.ownerName"
			:pets="selectedBooking.pets"
			:duration="selectedBooking.duration"
			:booking-date="selectedBooking.bookedDate"
			:total-paid="selectedBooking.totalPaid"
			@close="selectedBooking = null"
		/>
	</div>
</template>
