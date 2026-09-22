<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useAdminPetOwnerStore } from '../../stores/adminPetOwner'

interface OwnerBanStatusResponse {
	isBanned: boolean | null
}

const API_BASE_URL = 'http://localhost:8081/api'
const route = useRoute()
const router = useRouter()
const store = useAdminPetOwnerStore()
const isSubmitting = ref(false)

const ownerId = typeof route.params.id === 'string' ? route.params.id : ''

const returnToProfile = () => {
	router.push(ownerId ? `/admin/owners/profile/${ownerId}` : '/admin/owners')
}

const confirmBan = async () => {
	if (!ownerId) {
		returnToProfile()
		return
	}

	isSubmitting.value = true
	try {
		const response = await axios.patch<OwnerBanStatusResponse>(`${API_BASE_URL}/admin/owners/${ownerId}/ban`)
		store.setSelectedOwnerIsBanned(response.data.isBanned)
		returnToProfile()
	} catch (error) {
		console.error('Failed to ban pet owner:', error)
	} finally {
		isSubmitting.value = false
	}
}
</script>

<template>
	<div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/65 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="ban-user-title">
		<section class="w-full max-w-[232px] overflow-hidden rounded-[9px] bg-white text-[#171923] shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
			<header class="flex items-center justify-between border-b border-[#e8eaf0] px-[14px] py-[10px]">
				<h1 id="ban-user-title" class="text-[11px] font-semibold text-[#171923]">Ban User</h1>
				<button type="button" class="text-[18px] leading-none text-[#adb4c8] transition hover:text-[#ff7040]" aria-label="Close ban user dialog" @click="returnToProfile">×</button>
			</header>

			<div class="px-[14px] pb-[14px] pt-[15px]">
				<p class="text-[9px] text-[#7f8498]">Are you sure to ban this user?</p>

				<footer class="mt-[16px] flex items-center justify-between">
					<button type="button" class="rounded-full bg-[#fff0eb] px-[20px] py-[7px] text-[9px] font-semibold text-[#ff7040] transition hover:bg-[#ffe1d8]" :disabled="isSubmitting" @click="returnToProfile">
						Cancel
					</button>
					<button type="button" class="rounded-full bg-[#ff7040] px-[18px] py-[7px] text-[9px] font-semibold text-white transition hover:bg-[#f25d2c] disabled:cursor-not-allowed disabled:opacity-50" :disabled="isSubmitting" @click="confirmBan">
						{{ isSubmitting ? 'Banning...' : 'Ban User' }}
					</button>
				</footer>
			</div>
		</section>
	</div>
</template>
