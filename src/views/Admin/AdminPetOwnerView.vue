<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/AdminSidebar.vue'
import { useAdminPetOwnerStore } from '../../stores/adminPetOwner'

interface PetOwner {
	id: string
	name: string | null
	phone: string | null
	email: string
	petCount: number
	isBanned: boolean
	avatarUrl: string | null
}

interface OwnerAdminPageResponse {
	owners: PetOwner[]
	currentPage: number
	totalPages: number
	totalItems: number
	limit: number
}

const API_BASE_URL = 'http://localhost:8081/api'

const router = useRouter()
const store = useAdminPetOwnerStore()

const owners = ref<PetOwner[]>([])
const searchQuery = ref('')
const debouncedSearch = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 8

// Debounce search input so a request isn't fired on every keystroke
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (newValue) => {
	if (debounceTimer) clearTimeout(debounceTimer)

	debounceTimer = setTimeout(() => {
		debouncedSearch.value = newValue
	}, 300)
})

// Reset to first page whenever the search changes
watch(debouncedSearch, () => {
	currentPage.value = 1
})

// Cancel the previous in-flight request when a newer one is fired
let abortController: AbortController | null = null

const fetchOwners = async (pageNum: number, currentSearch: string) => {
	if (abortController) abortController.abort()
	abortController = new AbortController()

	isLoading.value = true
	errorMessage.value = ''

	try {
		const response = await axios.get<OwnerAdminPageResponse>(`${API_BASE_URL}/admin/owners`, {
			params: {
				page: pageNum,
				limit: pageSize,
				keyword: currentSearch.trim(),
			},
			signal: abortController.signal,
		})

		owners.value = response.data.owners || []
		totalPages.value = Math.max(1, response.data.totalPages)
	} catch (error) {
		if (axios.isCancel(error)) return

		console.error('Failed to fetch pet owners:', error)
		errorMessage.value = 'Unable to load pet owners. Please try again.'
		owners.value = []
	} finally {
		isLoading.value = false
	}
}

watch(
	[currentPage, debouncedSearch],
	() => {
		fetchOwners(currentPage.value, debouncedSearch.value)
	},
	{ immediate: true },
)

onUnmounted(() => {
	if (debounceTimer) clearTimeout(debounceTimer)
	if (abortController) abortController.abort()
})

const updateSearch = () => {
	// debounce watcher above resets the page once the query settles
}

const previousPage = () => {
	if (currentPage.value > 1) currentPage.value -= 1
}

const nextPage = () => {
	if (currentPage.value < totalPages.value) currentPage.value += 1
}

const avatarUrl = (owner: PetOwner) => owner.avatarUrl || '/image/dog1.jpg'

// share userId of the clicked row with the profile/pets/reviews pages via the store
const handleSelectOwner = (owner: PetOwner) => {
	store.selectOwner(owner.id, owner.name)
	router.push(`/admin/owners/profile/${owner.id}`)
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

						<div v-if="errorMessage" class="px-3 py-10 text-center text-[10px] text-[#f04444]">{{ errorMessage }}</div>
						<div v-else-if="isLoading" class="px-3 py-10 text-center text-[10px] text-[#9297a9]">Loading...</div>
						<div v-else-if="owners.length === 0" class="px-3 py-10 text-center text-[10px] text-[#9297a9]">No pet owners found.</div>
						<div
							v-for="owner in owners"
							:key="owner.id"
							class="grid h-[54px] grid-cols-[1.35fr_1fr_1.75fr_0.7fr_0.85fr] items-center border-b border-[#e5e7ef] px-2.5 text-[10px] last:border-b-0 hover:bg-[#fcfcfe] cursor-pointer"
							@click="handleSelectOwner(owner)"
						>
							<div class="flex items-center gap-2">
								<img :src="avatarUrl(owner)" :alt="owner.name ?? ''" class="h-7 w-7 rounded-full object-cover" />
								<span>{{ owner.name }}</span>
							</div>
							<span>{{ owner.phone }}</span>
							<span class="truncate pr-2">{{ owner.email }}</span>
							<span>{{ owner.petCount }}</span>
							<span class="flex items-center gap-1.5" :class="!owner.isBanned ? 'text-[#16c784]' : 'text-[#f04444]'">
								<span class="h-1 w-1 rounded-full bg-current"></span>{{ owner.isBanned ? 'Banned' : 'Normal' }}
							</span>
						</div>
					</div>
				</section>

				<nav v-if="owners.length > 0" class="mt-4 flex items-center justify-center gap-3 text-[10px] text-[#aab0c1]" aria-label="Pet owner pagination">
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
