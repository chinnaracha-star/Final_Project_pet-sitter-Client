<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminSidebar from '../../components/AdminSidebar.vue'

type OwnerStatus = 'Normal' | 'Banned'

interface PetOwner {
	id: number
	name: string
	phone: string
	email: string
	petCount: number
	status: OwnerStatus
	avatar: string
}

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 8

const owners: PetOwner[] = [
	{ id: 1, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Normal', avatar: '/image/dog1.jpg' },
	{ id: 2, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Normal', avatar: '/image/dog1.jpg' },
	{ id: 3, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Normal', avatar: '/image/dog1.jpg' },
	{ id: 4, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Banned', avatar: '/image/dog1.jpg' },
	{ id: 5, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Normal', avatar: '/image/dog1.jpg' },
	{ id: 6, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Normal', avatar: '/image/dog1.jpg' },
	{ id: 7, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Normal', avatar: '/image/dog1.jpg' },
	{ id: 8, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Normal', avatar: '/image/dog1.jpg' },
	{ id: 9, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Normal', avatar: '/image/dog1.jpg' },
	{ id: 10, name: 'John Wick', phone: '099 996 6734', email: 'johnwicklovedogs@dogorg.com', petCount: 2, status: 'Normal', avatar: '/image/dog1.jpg' },
]

const filteredOwners = computed(() => {
	const query = searchQuery.value.trim().toLowerCase()
	if (!query) return owners
	return owners.filter((owner) => [owner.name, owner.phone, owner.email].some((value) => value.toLowerCase().includes(query)))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOwners.value.length / pageSize)))

const paginatedOwners = computed(() => {
	const start = (currentPage.value - 1) * pageSize
	return filteredOwners.value.slice(start, start + pageSize)
})

const updateSearch = () => {
	currentPage.value = 1
}

const previousPage = () => {
	if (currentPage.value > 1) currentPage.value -= 1
}

const nextPage = () => {
	if (currentPage.value < totalPages.value) currentPage.value += 1
}
</script>

<template>
	<div class="flex min-h-screen bg-[#f7f8fc] text-[#242633]">
		<AdminSidebar />

		<main class="min-w-0 flex-1 px-5 py-6 sm:px-6 sm:py-7">
			<div class="mx-auto max-w-[1000px]">
				<header class="flex flex-wrap items-center justify-between gap-4">
					<h1 class="text-[15px] font-bold leading-6">Pet Owner</h1>
					<label class="relative w-full sm:w-[140px]">
						<span class="sr-only">Search pet owners</span>
						<input v-model="searchQuery" type="search" placeholder="Search..." class="h-[30px] w-full rounded-[5px] border border-[#e0e3ed] bg-white px-2.5 pr-8 text-[9px] text-[#30343f] outline-none placeholder:text-[#9298ab] focus:border-[#afb5ca]" @input="updateSearch" />
						<svg class="pointer-events-none absolute right-2.5 top-2 h-4 w-4 text-[#9aa0b4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true">
							<circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" />
						</svg>
					</label>
				</header>

				<section class="mt-3 overflow-x-auto rounded-xl bg-white shadow-[0_1px_2px_rgba(30,35,55,0.02)]" aria-labelledby="owners-heading">
					<h2 id="owners-heading" class="sr-only">Pet owner list</h2>
					<div class="min-w-[680px]">
						<div class="grid h-7 grid-cols-[1.35fr_1fr_1.75fr_0.7fr_0.85fr] items-center rounded-t-lg bg-black px-2.5 text-[8px] font-medium text-white">
							<span>Pet Owner</span>
							<span>Phone</span>
							<span>Email</span>
							<span>Pet(s)</span>
							<span>Status</span>
						</div>

						<div v-if="paginatedOwners.length === 0" class="px-3 py-10 text-center text-[10px] text-[#9297a9]">No pet owners found.</div>
						<div v-for="owner in paginatedOwners" :key="owner.id" class="grid h-[54px] grid-cols-[1.35fr_1fr_1.75fr_0.7fr_0.85fr] items-center border-b border-[#e5e7ef] px-2.5 text-[10px] last:border-b-0 hover:bg-[#fcfcfe]">
							<div class="flex items-center gap-2">
								<img :src="owner.avatar" :alt="owner.name" class="h-7 w-7 rounded-full object-cover" />
								<span>{{ owner.name }}</span>
							</div>
							<span>{{ owner.phone }}</span>
							<span class="truncate pr-2">{{ owner.email }}</span>
							<span>{{ owner.petCount }}</span>
							<span class="flex items-center gap-1.5" :class="owner.status === 'Normal' ? 'text-[#16c784]' : 'text-[#f04444]'">
								<span class="h-1 w-1 rounded-full bg-current"></span>{{ owner.status }}
							</span>
						</div>
					</div>
				</section>

				<nav v-if="filteredOwners.length > 0" class="mt-4 flex items-center justify-center gap-3 text-[10px] text-[#aab0c1]" aria-label="Pet owner pagination">
					<button type="button" class="p-1.5 text-[#aab0c1] transition hover:text-[#ff7040] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page" :disabled="currentPage === 1" @click="previousPage">
						<svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m7.5 2.5-3.5 3.5 3.5 3.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg>
					</button>
					<button type="button" class="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff0eb] text-[#ff7040]" aria-current="page">{{ currentPage }}</button>
					<span v-if="totalPages > 1" class="text-[#b8bfd0]">of {{ totalPages }}</span>
					<button type="button" class="p-1.5 text-[#aab0c1] transition hover:text-[#ff7040] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page" :disabled="currentPage === totalPages" @click="nextPage">
						<svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m4.5 2.5 3.5 3.5-3.5 3.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg>
					</button>
				</nav>
			</div>
		</main>
	</div>
</template>
