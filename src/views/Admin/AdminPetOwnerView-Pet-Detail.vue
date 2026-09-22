<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

interface PetDetail {
	id: number
	name: string
	avatarUrl: string | null
	petTypeName: string | null
	breed: string | null
	sex: string | null
	ageMonths: number | null
	color: string | null
	weightKg: number | null
	about: string | null
}

interface OwnerPetResponse {
	id: string
	name: string | null
	pets: PetDetail[]
}

const API_BASE_URL = 'http://localhost:8081/api'
const route = useRoute()
const router = useRouter()
const pet = ref<PetDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const displayValue = (value: string | number | null) => value ?? '-'

const formatAge = (ageMonths: number | null) => ageMonths === null ? '-' : `${ageMonths} Month${ageMonths === 1 ? '' : 's'}`
const formatWeight = (weightKg: number | null) => weightKg === null ? '-' : `${weightKg} Kilogram${weightKg === 1 ? '' : 's'}`

const fetchPet = async (ownerId: string, petId: string) => {
	isLoading.value = true
	errorMessage.value = ''

	try {
		const response = await axios.get<OwnerPetResponse>(`${API_BASE_URL}/admin/owners/${ownerId}`)
		pet.value = response.data.pets.find((ownerPet) => ownerPet.id === Number(petId)) || null
		if (!pet.value) errorMessage.value = 'This pet could not be found for the selected owner.'
	} catch (error) {
		console.error('Failed to fetch pet detail:', error)
		pet.value = null
		errorMessage.value = 'Unable to load this pet. Please return to the pet list and try again.'
	} finally {
		isLoading.value = false
	}
}

const returnToPets = () => {
	const ownerId = typeof route.params.id === 'string' ? route.params.id : ''
	router.push(ownerId ? `/admin/owners/profile/${ownerId}/pets` : '/admin/owners')
}

watch(
	() => [route.params.id, route.params.petId],
	([ownerId, petId]) => {
		if (typeof ownerId !== 'string' || !ownerId || typeof petId !== 'string' || !petId) {
			router.replace('/admin/owners')
			return
		}
		fetchPet(ownerId, petId)
	},
	{ immediate: true },
)
</script>

<template>
	<div class="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 py-8 text-[#171923]">
		<section class="w-full max-w-[442px] overflow-hidden rounded-[9px] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]" aria-labelledby="pet-detail-title">
			<header class="flex items-center justify-between border-b border-[#e9ebf1] px-6 py-[14px]">
				<h1 id="pet-detail-title" class="text-[14px] font-bold text-[#373a48]">{{ pet?.name || 'Pet Detail' }}</h1>
				<button type="button" class="text-[21px] leading-none text-[#3f4350] transition hover:text-[#ff7040]" aria-label="Back to pets" @click="returnToPets">×</button>
			</header>

			<div v-if="isLoading" class="px-6 py-16 text-center text-xs text-[#9298ab]">Loading pet...</div>
			<div v-else-if="errorMessage" class="px-6 py-16 text-center text-xs text-[#f04444]">{{ errorMessage }}</div>
			<div v-else-if="pet" class="grid gap-5 px-5 py-5 sm:grid-cols-[140px_minmax(0,1fr)] sm:px-6 sm:py-5">
				<div class="flex flex-col items-center">
					<img :src="pet.avatarUrl || '/image/dog1.jpg'" :alt="pet.name" class="h-[133px] w-[133px] rounded-full object-cover" />
					<h2 class="mt-2 text-[12px] font-bold text-[#171923]">{{ pet.name }}</h2>
				</div>

				<dl class="grid grid-cols-2 gap-x-7 gap-y-5 rounded-md bg-[#fbfbfd] px-3.5 py-4 text-[10px]">
					<div>
						<dt class="font-semibold text-[#adb3c8]">Pet Type</dt>
						<dd class="mt-1 text-[#30343f]">{{ displayValue(pet.petTypeName) }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Breed</dt>
						<dd class="mt-1 text-[#30343f]">{{ displayValue(pet.breed) }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Sex</dt>
						<dd class="mt-1 text-[#30343f]">{{ displayValue(pet.sex) }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Age</dt>
						<dd class="mt-1 text-[#30343f]">{{ formatAge(pet.ageMonths) }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Color</dt>
						<dd class="mt-1 text-[#30343f]">{{ displayValue(pet.color) }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Weight</dt>
						<dd class="mt-1 text-[#30343f]">{{ formatWeight(pet.weightKg) }}</dd>
					</div>
					<div class="col-span-2">
						<dt class="font-semibold text-[#adb3c8]">About</dt>
						<dd class="mt-1 text-[#30343f]">{{ displayValue(pet.about) }}</dd>
					</div>
				</dl>
			</div>

			<footer class="flex justify-end px-6 pb-5">
				<button type="button" class="text-[9px] font-semibold text-[#ff7040] transition hover:text-[#f25d2c]" @click="returnToPets">Back to Pets</button>
			</footer>
		</section>
	</div>
</template>
