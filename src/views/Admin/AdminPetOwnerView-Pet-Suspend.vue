<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const API_BASE_URL = 'http://localhost:8081/api'
const route = useRoute()
const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')

const returnToPetDetail = () => {
	const ownerId = typeof route.params.id === 'string' ? route.params.id : ''
	const petId = typeof route.params.petId === 'string' ? route.params.petId : ''
	router.push(ownerId && petId ? `/admin/owners/profile/${ownerId}/pets/${petId}` : '/admin/owners')
}

const suspendPet = async () => {
	const ownerId = typeof route.params.id === 'string' ? route.params.id : ''
	const petId = typeof route.params.petId === 'string' ? route.params.petId : ''
	if (!ownerId || !petId) {
		router.replace('/admin/owners')
		return
	}

	isSubmitting.value = true
	errorMessage.value = ''
	try {
		await axios.patch(`${API_BASE_URL}/admin/owners/${ownerId}/pets/${petId}/suspend`)
		router.push(`/admin/owners/profile/${ownerId}/pets`)
	} catch (error) {
		console.error('Failed to suspend pet:', error)
		errorMessage.value = 'Unable to suspend this pet. Please try again.'
	} finally {
		isSubmitting.value = false
	}
}
</script>

<template>
	<div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/65 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="suspend-pet-title">
		<section class="w-full max-w-[222px] overflow-hidden rounded-[9px] bg-white text-[#171923] shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
			<header class="flex items-center justify-between border-b border-[#e8eaf0] px-[13px] py-[10px]">
				<h1 id="suspend-pet-title" class="text-[11px] font-semibold text-[#171923]">Suspend Pet</h1>
				<button type="button" class="text-[18px] leading-none text-[#adb4c8] transition hover:text-[#ff7040]" aria-label="Close suspend pet dialog" :disabled="isSubmitting" @click="returnToPetDetail">×</button>
			</header>

			<div class="px-[13px] pb-[13px] pt-[14px]">
				<p class="text-[9px] text-[#7f8498]">Are you sure to suspend this pet?</p>
				<p v-if="errorMessage" class="mt-2 text-[9px] text-[#f04444]">{{ errorMessage }}</p>

				<footer class="mt-[15px] flex items-center justify-between">
					<button type="button" class="rounded-full bg-[#fff0eb] px-[19px] py-[7px] text-[9px] font-semibold text-[#ff7040] transition hover:bg-[#ffe1d8] disabled:cursor-not-allowed disabled:opacity-50" :disabled="isSubmitting" @click="returnToPetDetail">
						Cancel
					</button>
					<button type="button" class="rounded-full bg-[#ff7040] px-[15px] py-[7px] text-[9px] font-semibold text-white transition hover:bg-[#f25d2c] disabled:cursor-not-allowed disabled:opacity-50" :disabled="isSubmitting" @click="suspendPet">
						{{ isSubmitting ? 'Suspending...' : 'Suspend This Pet' }}
					</button>
				</footer>
			</div>
		</section>
	</div>
</template>
