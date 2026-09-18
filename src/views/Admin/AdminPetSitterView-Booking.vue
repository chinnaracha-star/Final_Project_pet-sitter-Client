<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { useAdminPetSitterStore } from '../../stores/adminPetSitter'

const store = useAdminPetSitterStore()

type BookingStatus = 'Waiting for confirm' | 'Waiting for service' | 'In service' | 'Success' | 'Canceled'

interface Booking {
	ownerName: string
	petCount: number
	duration: string
	bookedDate: string
	status: BookingStatus
}

const bookings: Booking[] = [
	{ ownerName: 'John Wick', petCount: 2, duration: '3 hours', bookedDate: '25 Aug, 7 AM - 10 AM', status: 'Waiting for confirm' },
	{ ownerName: 'Robert Jr.', petCount: 1, duration: '24 hours', bookedDate: '12 Aug, 7 AM - 13 Aug, 7 AM', status: 'Waiting for confirm' },
	{ ownerName: 'Maren Press', petCount: 6, duration: '2 hours', bookedDate: '2 Aug, 7 AM - 9 AM', status: 'Waiting for service' },
	{ ownerName: 'Lincoln Vaccaro', petCount: 4, duration: '3 hours', bookedDate: '25 Aug, 7 AM - 10 AM', status: 'In service' },
	{ ownerName: 'Andaman R', petCount: 2, duration: '3 hours', bookedDate: '25 Aug, 7 AM - 10 AM', status: 'Success' },
	{ ownerName: 'Pakwan', petCount: 2, duration: '3 hours', bookedDate: '25 Aug, 7 AM - 10 AM', status: 'Success' },
	{ ownerName: 'Chatchai Haithong', petCount: 2, duration: '3 hours', bookedDate: '25 Aug, 7 AM - 10 AM', status: 'Canceled' },
	{ ownerName: 'Steve J.', petCount: 2, duration: '3 hours', bookedDate: '25 Aug, 7 AM - 10 AM', status: 'Success' },
]

const statusClass: Record<BookingStatus, string> = {
	'Waiting for confirm': 'text-[#ef82b6]',
	'Waiting for service': 'text-[#f6ad2f]',
	'In service': 'text-[#57b7ef]',
	Success: 'text-[#16c98d]',
	Canceled: 'text-[#ff4242]',
}
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
					<div class="overflow-x-auto">
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
								<tr v-for="booking in bookings" :key="`${booking.ownerName}-${booking.bookedDate}`" class="border-b border-[#e5e8f0] last:border-b-0">
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
	</div>
</template>
