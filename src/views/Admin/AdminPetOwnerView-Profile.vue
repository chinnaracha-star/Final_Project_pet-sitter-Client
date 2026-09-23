<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import AdminSidebar from '../../components/AdminSidebar.vue'
import { useAdminPetOwnerStore } from '../../stores/adminPetOwner'

type OwnerTab = 'Profile' | 'Pets' | 'Reviews'

interface OwnerDetail {
	id: string
	name: string | null
	email: string
	phone: string | null
	idNumber: string | null
	dateOfBirth: string | null
	avatarUrl: string | null
	isBanned: boolean | null
}

const API_BASE_URL = 'http://localhost:8081/api'

const route = useRoute()
const router = useRouter()
const store = useAdminPetOwnerStore()
const activeTab = ref<OwnerTab>('Profile')
const owner = ref<OwnerDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const isUpdatingBanStatus = ref(false)

const displayValue = (value: string | null) => value || '-'

const formatDate = (date: string | null) => {
	if (!date) return '-'
	return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

const fetchOwner = async (ownerId: string) => {
	isLoading.value = true
	errorMessage.value = ''

	try {
		const response = await axios.get<OwnerDetail>(`${API_BASE_URL}/admin/owners/${ownerId}`)
		owner.value = response.data
		store.selectOwner(response.data.id, response.data.name)
		store.setSelectedOwnerIsBanned(response.data.isBanned)
	} catch (error) {
		console.error('Failed to fetch pet owner:', error)
		owner.value = null
		errorMessage.value = 'Unable to load this pet owner. Please return to the owner list and try again.'
	} finally {
		isLoading.value = false
	}
}

const openBanStatusConfirmation = () => {
	if (!owner.value) return
	router.push(`/admin/owners/profile/${owner.value.id}/${owner.value.isBanned ? 'unban' : 'ban'}`)
}

const navigateToTab = (tab: OwnerTab) => {
	if (!owner.value) return

	if (tab === 'Pets') {
		router.push(`/admin/owners/profile/${owner.value.id}/pets`)
		return
	}

	if (tab === 'Reviews') {
		router.push('/admin/owners/profile/reviews')
		return
	}

	activeTab.value = tab
}

watch(
	() => route.params.id,
	(ownerId) => {
		if (typeof ownerId !== 'string' || !ownerId) {
			router.replace('/admin/owners')
			return
		}
		fetchOwner(ownerId)
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
					<RouterLink to="/admin/owners" class="text-xl leading-none text-[#9298ab]" aria-label="Back to pet owners">‹</RouterLink>
					<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ owner?.name || 'Pet Owner' }}</h1>
				</header>

				<nav class="mt-4 flex gap-2" aria-label="Pet owner sections">
					<button
						v-for="tab in (['Profile', 'Pets', 'Reviews'] as OwnerTab[])"
						:key="tab"
						type="button"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="activeTab === tab ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="navigateToTab(tab)"
					>
						{{ tab }}
					</button>
				</nav>

				<section class="rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:p-7">
					<div v-if="isLoading" class="py-16 text-center text-xs text-[#9298ab]">Loading pet owner...</div>
					<div v-else-if="errorMessage" class="py-16 text-center text-xs text-[#f04444]">{{ errorMessage }}</div>
					<div v-else-if="owner && activeTab === 'Profile'" class="grid gap-6 md:grid-cols-[145px_minmax(0,1fr)]">
						<img :src="owner.avatarUrl || '/image/dog1.jpg'" :alt="owner.name || 'Pet owner'" class="mx-auto h-[140px] w-[140px] rounded-full object-cover md:mx-0" />

						<div class="rounded-md bg-[#fbfbfd] px-4 py-4 sm:px-5 sm:py-4">
							<dl class="grid gap-5 text-[10px]">
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">Pet Owner Name</dt>
									<dd class="mt-1 text-[#30343f]">{{ displayValue(owner.name) }}</dd>
								</div>
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">Email</dt>
									<dd class="mt-1 break-all text-[#30343f]">{{ displayValue(owner.email) }}</dd>
								</div>
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">Phone</dt>
									<dd class="mt-1 text-[#30343f]">{{ displayValue(owner.phone) }}</dd>
								</div>
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">ID Number</dt>
									<dd class="mt-1 text-[#30343f]">{{ displayValue(owner.idNumber) }}</dd>
								</div>
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">Date of Birth</dt>
									<dd class="mt-1 text-[#30343f]">{{ formatDate(owner.dateOfBirth) }}</dd>
								</div>
							</dl>
						</div>

						<div class="md:col-span-2 flex justify-end">
							<button type="button" class="text-[10px] font-semibold text-[#ff7040] transition hover:text-[#f25d2c] disabled:cursor-not-allowed disabled:opacity-50" :disabled="isUpdatingBanStatus" @click="openBanStatusConfirmation">
								{{ owner.isBanned ? 'Unban This User' : 'Ban This User' }}
							</button>
						</div>
					</div>

					<div v-else class="flex min-h-[260px] items-center justify-center text-center">
						<p class="text-xs text-[#9298ab]">No {{ activeTab.toLowerCase() }} records are available in this mock view.</p>
					</div>
				</section>
			</div>
		</main>
	</div>
</template>
