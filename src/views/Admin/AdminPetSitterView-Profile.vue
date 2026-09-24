<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import SitterLocationMap from '../../components/admin/SitterLocationMap.vue'
import AdminPetSitterViewProfileRejectConfirmation from './AdminPetSitterView-Profile-RejectConfirmation.vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminPetSitterStore, type SitterStatus } from '../../stores/adminPetSitter'
import {
	approveSitter,
	getSitterApproval,
	rejectSitter,
	type ProfilePayload,
	type ProfileResponse,
} from '../../services/sitterApproval'

const store = useAdminPetSitterStore()
const route = useRoute()

const profile = ref<ProfilePayload | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const approvalStatus = ref<SitterStatus | null>(null)
const showRejectConfirmation = ref(false)

const applyResponse = (response: ProfileResponse) => {
	profile.value = response.pendingProfile ?? response.profile
	approvalStatus.value = response.approvalStatus
	store.setApprovalStatus(response.approvalStatus)
}

const fetchSitterDetail = async (id: string) => {
	isLoading.value = true
	errorMessage.value = ''
	try {
		applyResponse(await getSitterApproval(id))
	} catch (error) {
		console.error('Failed to fetch pet sitter profile:', error)
		errorMessage.value = error instanceof Error ? error.message : 'Unable to load pet sitter profile.'
	} finally {
		isLoading.value = false
	}
}

// fall back to the userId in the URL (e.g. after a page refresh) when the store hasn't been populated yet
onMounted(() => {
	const queryId = route.query.id
	if (!store.selectedSitterId && typeof queryId === 'string') {
		store.selectedSitterId = queryId
	}
	if (store.selectedSitterId) fetchSitterDetail(store.selectedSitterId)
})

watch(
	() => store.selectedSitterId,
	(id) => {
		if (id) fetchSitterDetail(id)
	},
)

const handleRejectConfirm = async (reason: string) => {
	showRejectConfirmation.value = false
	if (!store.selectedSitterId) return
	if (!['Waiting for verify', 'Waiting for approve'].includes(approvalStatus.value ?? '')) return
	isSubmitting.value = true
	errorMessage.value = ''
	try {
		applyResponse(await rejectSitter(store.selectedSitterId, reason))
	} catch (error) {
		console.error('Failed to reject pet sitter profile:', error)
		errorMessage.value = error instanceof Error ? error.message : 'Unable to reject pet sitter profile.'
	} finally {
		isSubmitting.value = false
	}
}

const handleApprove = async () => {
	if (!store.selectedSitterId) return
	if (!['Waiting for verify', 'Waiting for approve'].includes(approvalStatus.value ?? '')) return
	isSubmitting.value = true
	errorMessage.value = ''
	try {
		applyResponse(await approveSitter(store.selectedSitterId))
	} catch (error) {
		console.error('Failed to approve pet sitter profile:', error)
		errorMessage.value = error instanceof Error ? error.message : 'Unable to approve pet sitter profile.'
	} finally {
		isSubmitting.value = false
	}
}

const formatDate = (value: string | null) => {
	if (!value) return '-'
	return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const fullAddress = () => {
	if (!profile.value) return ''
	return [profile.value.addressDetail, profile.value.subDistrict, profile.value.district, profile.value.province, profile.value.postCode]
		.filter(Boolean)
		.join(', ')
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
						<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ profile?.fullName ?? store.selectedSitterName ?? profile?.displayName ?? 'Unnamed user' }}</h1>
						<span class="flex shrink-0 items-center gap-1.5 text-[10px] text-[#ef82b6]">
							<span class="h-1 w-1 rounded-full bg-current"></span>
							{{ approvalStatus ?? store.selectedSitterStatus ?? 'Waiting for approve' }}
						</span>
					</div>

					<div v-if="approvalStatus === 'Waiting for verify' || approvalStatus === 'Waiting for approve'" class="flex items-center gap-3">
						<button type="button" class="rounded-full bg-[#fff4ef] px-5 py-2 text-[9px] font-semibold text-[#f47755] transition hover:bg-[#ffe6dc] disabled:opacity-50" :disabled="isSubmitting" @click="showRejectConfirmation = true">Reject</button>
						<button type="button" class="rounded-full bg-[#ff7040] px-5 py-2 text-[9px] font-semibold text-white transition hover:bg-[#f25d2c] disabled:opacity-50" :disabled="isSubmitting" @click="handleApprove">
							{{ isSubmitting ? 'Saving...' : approvalStatus === 'Waiting for verify' ? 'Verify' : 'Approve' }}
						</button>
					</div>
				</header>

				<AdminPetSitterViewProfileRejectConfirmation
					v-if="showRejectConfirmation"
					@cancel="showRejectConfirmation = false"
					@reject="handleRejectConfirm"
				/>

				<nav class="mt-4 flex gap-2" aria-label="Sitter profile sections">
					<button
						type="button"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="store.activeTab === 'Profile' ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="store.activeTab = 'Profile'"
					>
						Profile
					</button>
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

				<div v-if="isLoading" class="mt-4 rounded-xl bg-white p-8 text-center text-[10px] text-[#9297a9] shadow-[0_1px_3px_rgba(40,45,70,0.02)]">Loading pet sitter profile...</div>
				<div v-else-if="errorMessage" class="mt-4 rounded-xl bg-white p-8 text-center text-[10px] text-[#f04444] shadow-[0_1px_3px_rgba(40,45,70,0.02)]">{{ errorMessage }}</div>

				<section v-else-if="store.activeTab === 'Profile'" class="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:p-7">
					<div class="grid gap-7 md:grid-cols-[125px_minmax(0,1fr)]">
						<img :src="profile?.avatarUrl || '/image/dog2.jpg'" :alt="profile?.fullName || 'Pet sitter'" class="mx-auto h-32 w-32 rounded-full object-cover md:mx-0" />

						<div class="rounded-md bg-[#fbfbfd] p-4 sm:p-5">
							<dl class="grid gap-4 sm:grid-cols-2">
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Full Name</dt><dd class="mt-1 text-[10px]">{{ profile?.fullName || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Experience</dt><dd class="mt-1 text-[10px]">{{ profile?.experienceYears || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Email</dt><dd class="mt-1 text-[10px]">{{ profile?.email || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Phone</dt><dd class="mt-1 text-[10px]">{{ profile?.phone || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">ID Number</dt><dd class="mt-1 text-[10px]">{{ profile?.idNumber || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Date of Birth</dt><dd class="mt-1 text-[10px]">{{ formatDate(profile?.dateOfBirth ?? null) }}</dd></div>
							</dl>
							<div class="mt-5">
								<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Introduction</h2>
								<p class="mt-1 max-w-3xl text-[10px] leading-[1.55] text-[#30343f]">{{ profile?.introduction || 'No introduction provided.' }}</p>
							</div>
						</div>
					</div>

					<div v-if="approvalStatus !== 'Unverified' && approvalStatus !== 'Waiting for verify'" class="mt-6 rounded-md bg-[#fbfbfd] p-4 sm:p-5">
						<div>
							<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Pet sitter name (Trade Name)</h2>
							<p class="mt-1 text-[10px]">{{ profile?.displayName || '-' }}</p>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Pet type</h2>
						<div class="mt-2 flex flex-wrap gap-2">
							<span v-for="petType in profile?.petTypes" :key="petType" class="rounded-full border border-[#6fe0bc] px-2.5 py-0.5 text-[9px] text-[#20c995]">{{ petType }}</span>
							<span v-if="!profile?.petTypes.length" class="text-[9px] text-[#9297a9]">No pet types selected.</span>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Services</h2>
						<div class="mt-2 space-y-2 text-[10px] leading-[1.5]">
							<p>{{ profile?.services || 'No services listed.' }}</p>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">My Place</h2>
						<p class="mt-1 text-[10px] leading-[1.5]">{{ profile?.myPlace || '-' }}</p>
					</div>

					<div v-if="approvalStatus !== 'Unverified' && approvalStatus !== 'Waiting for verify'" class="mt-6 rounded-md bg-[#fbfbfd] p-4 sm:p-5">
						<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Address</h2>
						<p class="mt-1 text-[10px]">{{ fullAddress() || '-' }}</p>
						<div class="mt-5">
							<SitterLocationMap :latitude="profile?.latitude ?? null" :longitude="profile?.longitude ?? null" />
						</div>
					</div>
				</section>

				<section v-else class="rounded-xl bg-white p-8 text-center shadow-[0_1px_3px_rgba(40,45,70,0.02)]">
					<h2 class="text-sm font-semibold text-[#30343f]">{{ store.activeTab }}</h2>
					<p class="mt-2 text-xs text-[#9298ab]">No {{ store.activeTab.toLowerCase() }} records are available in this mock view.</p>
				</section>
			</div>
		</main>
	</div>
</template>
