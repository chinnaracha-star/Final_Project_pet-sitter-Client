<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import AdminSidebar from '../../components/AdminSidebar.vue'

interface Pet {
	id: number
	name: string
	avatarUrl: string | null
	petTypeName: string | null
	isSuspended: boolean | null
}

interface OwnerPetResponse {
	id: string
	name: string | null
	pets: Pet[]
}

const API_BASE_URL = 'http://localhost:8081/api'
const route = useRoute()
const router = useRouter()
const owner = ref<Pick<OwnerPetResponse, 'id' | 'name'> | null>(null)
const pets = ref<Pet[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const typeClass = (petType: string | null) => {
	switch (petType?.toLowerCase()) {
		case 'dog': return 'border-[#50d9a8] text-[#22c993]'
		case 'cat': return 'border-[#f38ab8] text-[#ed71a7]'
		case 'bird': return 'border-[#78c7f1] text-[#4eafe7]'
		default: return 'border-[#b8bfd0] text-[#71778a]'
	}
}

const fetchOwnerPets = async (ownerId: string) => {
	isLoading.value = true
	errorMessage.value = ''

	try {
		const response = await axios.get<OwnerPetResponse>(`${API_BASE_URL}/admin/owners/${ownerId}`)
		owner.value = { id: response.data.id, name: response.data.name }
		pets.value = (response.data.pets || []).filter((pet) => pet.isSuspended === false)
	} catch (error) {
		console.error('Failed to fetch pet owner pets:', error)
		owner.value = null
		pets.value = []
		errorMessage.value = 'Unable to load this pet owner’s pets. Please return to the owner list and try again.'
	} finally {
		isLoading.value = false
	}
}

watch(
	() => route.params.id,
	(ownerId) => {
		if (typeof ownerId !== 'string' || !ownerId) {
			router.replace('/admin/owners')
			return
		}
		fetchOwnerPets(ownerId)
	},
	{ immediate: true },
)
</script>

<template>
	<div class="flex min-h-screen bg-[#f7f8fc] text-[#30343f]">
		<AdminSidebar />

		<main class="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-7">
			<div class="mx-auto max-w-[1000px]">
				<header class="flex items-center gap-3 px-1">
					<RouterLink :to="owner ? `/admin/owners/profile/${owner.id}` : '/admin/owners'" class="text-xl leading-none text-[#9298ab]" aria-label="Back to pet owner profile">‹</RouterLink>
					<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ owner?.name || 'Pet Owner' }}</h1>
				</header>

				<nav class="mt-4 flex gap-2" aria-label="Pet owner sections">
					<RouterLink :to="owner ? `/admin/owners/profile/${owner.id}` : '/admin/owners'" class="rounded-t-md bg-[#e2e5f1] px-5 py-3 text-[11px] font-semibold text-[#858b9f] transition hover:bg-[#d9ddeb]">Profile</RouterLink>
					<RouterLink :to="owner ? `/admin/owners/profile/${owner.id}/pets` : '/admin/owners'" class="rounded-t-md bg-white px-5 py-3 text-[11px] font-semibold text-[#ff7040]">Pets</RouterLink>
					<RouterLink to="/admin/owners/profile/reviews" class="rounded-t-md bg-[#e2e5f1] px-5 py-3 text-[11px] font-semibold text-[#858b9f] transition hover:bg-[#d9ddeb]">Reviews</RouterLink>
				</nav>

				<section class="min-h-[455px] rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:p-6">
					<div v-if="isLoading" class="py-16 text-center text-xs text-[#9298ab]">Loading pets...</div>
					<div v-else-if="errorMessage" class="py-16 text-center text-xs text-[#f04444]">{{ errorMessage }}</div>
					<div v-else-if="pets.length === 0" class="py-16 text-center text-xs text-[#9298ab]">This pet owner has no pets.</div>
					<div v-else class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
						<RouterLink v-for="pet in pets" :key="pet.id" :to="`/admin/owners/profile/${owner!.id}/pets/${pet.id}`" class="flex h-[133px] flex-col items-center rounded-[9px] border border-[#e1e5ee] px-3 py-3 transition hover:border-[#ff7040] hover:bg-[#fffaf8] focus:outline-none focus:ring-2 focus:ring-[#ff7040]">
							<img :src="pet.avatarUrl || '/image/dog1.jpg'" :alt="pet.name" class="h-[59px] w-[59px] rounded-full object-cover" />
							<h2 class="mt-2 text-[12px] font-bold text-[#4a4d5b]">{{ pet.name }}</h2>
							<span class="mt-1 rounded-full border px-2.5 py-0.5 text-[9px]" :class="typeClass(pet.petTypeName)">{{ pet.petTypeName || 'Unknown' }}</span>
						</RouterLink>
					</div>
				</section>
			</div>
		</main>
	</div>
</template>
