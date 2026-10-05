<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import SitterLocationMap from '../../components/admin/SitterLocationMap.vue'
import AdminPetSitterViewProfileRejectConfirmation from './AdminPetSitterView-Profile-RejectConfirmation.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminPetSitterStore, type SitterStatus } from '../../stores/adminPetSitter'
import { adminApi } from '../../services/adminApi'

const store = useAdminPetSitterStore()
const route = useRoute()

interface SitterUser {
	name: string | null
	email: string
	phone: string | null
	idNumber: string | null
	dateOfBirth: string | null
	avatarUrl: string | null
}

interface PetType {
	id: number
	name: string
}

interface SitterProfileDetail {
	userId: string
	displayName: string
	introduction: string | null
	myPlace: string | null
	services: string | null
	addressDetail: string | null
	district: string | null
	subDistrict: string | null
	province: string | null
	postCode: string | null
	experienceYears: string | null
	pet_sitter_state: number | null
	approvalStatus: SitterStatus
	latitude: number | null
	longitude: number | null
	listed: boolean
	pendingProfile: string | null
}

// Shape of the JSON stored in sitter_profiles.pending_profile (submitted by the sitter, not yet applied to the live columns)
interface PendingProfile {
	fullName: string | null
	phone: string | null
	email: string | null
	experienceYears: string | null
	dateOfBirth: string | null
	idNumber: string | null
	avatarUrl: string | null
	introduction: string | null
	displayName: string | null
	petTypes: string[]
	services: string | null
	myPlace: string | null
	photoUrls: string[]
	addressDetail: string | null
	district: string | null
	subDistrict: string | null
	province: string | null
	postCode: string | null
	latitude: number | null
	longitude: number | null
}

interface SitterProfileDetailResponse {
	sitterProfile: SitterProfileDetail
	user: SitterUser
	petTypes: PetType[]
	photoUrls: string[]
}

const profile = ref<SitterProfileDetail | null>(null)
const sitterUser = ref<SitterUser | null>(null)
const petTypes = ref<PetType[]>([])
const sitterPhotoUrls = ref<string[]>([])
const pendingProfile = ref<PendingProfile | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const approvalStatus = ref<SitterStatus | null>(null)
const isListed = ref(false)
const showRejectConfirmation = ref(false)

const petTypeColors: Record<string, { border: string; text: string }> = {
	dog: { border: '#50d9a8', text: '#22c993' },
	cat: { border: '#f38ab8', text: '#ed71a7' },
	bird: { border: '#78c7f1', text: '#4eafe7' },
}
const defaultPetTypeColor = { border: '#b8bfd0', text: '#71778a' }

const petTypeColor = (petType: string) => petTypeColors[petType.toLowerCase()] ?? defaultPetTypeColor

// Waiting statuses show what the sitter submitted (pending_profile), everything else shows the live/applied data
const usePendingProfile = computed(() => approvalStatus.value === 'Waiting for verify' || approvalStatus.value === 'Waiting for approve')

const displayAvatarUrl = computed(() => (usePendingProfile.value ? pendingProfile.value?.avatarUrl : sitterUser.value?.avatarUrl) || null)
const displayFullName = computed(() => (usePendingProfile.value ? pendingProfile.value?.fullName : sitterUser.value?.name) ?? null)
const displayPhone = computed(() => (usePendingProfile.value ? pendingProfile.value?.phone : sitterUser.value?.phone) ?? null)
const displayIdNumber = computed(() => (usePendingProfile.value ? pendingProfile.value?.idNumber : sitterUser.value?.idNumber) ?? null)
const displayDateOfBirth = computed(() => (usePendingProfile.value ? pendingProfile.value?.dateOfBirth : sitterUser.value?.dateOfBirth) ?? null)
const displayIntroduction = computed(() => (usePendingProfile.value ? pendingProfile.value?.introduction : profile.value?.introduction) ?? null)
const displayExperienceYears = computed(() => (usePendingProfile.value ? pendingProfile.value?.experienceYears : profile.value?.experienceYears) ?? null)
const displaySitterName = computed(() => (usePendingProfile.value ? pendingProfile.value?.displayName : profile.value?.displayName) ?? null)
const displayServices = computed(() => (usePendingProfile.value ? pendingProfile.value?.services : profile.value?.services) ?? null)
const displayMyPlace = computed(() => (usePendingProfile.value ? pendingProfile.value?.myPlace : profile.value?.myPlace) ?? null)
const displayLatitude = computed(() => (usePendingProfile.value ? pendingProfile.value?.latitude : profile.value?.latitude) ?? null)
const displayLongitude = computed(() => (usePendingProfile.value ? pendingProfile.value?.longitude : profile.value?.longitude) ?? null)
const displayPetTypeNames = computed<string[]>(() => (usePendingProfile.value ? pendingProfile.value?.petTypes ?? [] : petTypes.value.map((petType) => petType.name)))
const displayPhotoUrls = computed<string[]>(() => (usePendingProfile.value ? pendingProfile.value?.photoUrls ?? [] : sitterPhotoUrls.value))

const fetchSitterDetail = async (id: string) => {
	isLoading.value = true
	errorMessage.value = ''
	try {
		const response = await adminApi.get<SitterProfileDetailResponse>(`/sitterprofile/${id}`)
		profile.value = response.data.sitterProfile
		sitterUser.value = response.data.user
		petTypes.value = response.data.petTypes || []
		sitterPhotoUrls.value = response.data.photoUrls || []
		approvalStatus.value = response.data.sitterProfile.approvalStatus
		isListed.value = response.data.sitterProfile.listed
		const rawPendingProfile = response.data.sitterProfile.pendingProfile
		pendingProfile.value = rawPendingProfile ? (JSON.parse(rawPendingProfile) as PendingProfile) : null
	} catch (error) {
		console.error('Failed to fetch pet sitter profile:', error)
		errorMessage.value = 'Unable to load pet sitter profile.'
	} finally {
		isLoading.value = false
	}
}

// fall back to the userId in the URL (e.g. after a page refresh) when the store hasn't been populated yet
onMounted(() => {
	const queryId = route.query.id
	if (!store.selectedSitterId && typeof queryId === 'string') {
		// let the watcher below fetch once the id is set, avoiding a duplicate concurrent request
		store.selectedSitterId = queryId
		return
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

	if (approvalStatus.value !== 'Waiting for verify' && approvalStatus.value !== 'Waiting for approve') return

	try {
		await axios.patch(`${API_BASE_URL}/sitterprofile/${store.selectedSitterId}/reject`, { reason })
		const nextStatus = approvalStatus.value === 'Waiting for verify' ? 'Unverified' : 'Rejected'
		approvalStatus.value = nextStatus
		isListed.value = false
		store.setApprovalStatus(nextStatus)
		await fetchSitterDetail(store.selectedSitterId)
	} catch (error) {
		console.error('Failed to reject pet sitter profile:', error)
		errorMessage.value = 'Unable to reject pet sitter profile.'
	}
}

const handleApprove = async () => {
	if (!store.selectedSitterId) return

	if (approvalStatus.value !== 'Waiting for verify' && approvalStatus.value !== 'Waiting for approve') return

	try {
		const endpoint = approvalStatus.value === 'Waiting for verify' ? 'verify' : 'approve'
		await axios.patch(`${API_BASE_URL}/sitterprofile/${store.selectedSitterId}/${endpoint}`)
		const nextStatus = approvalStatus.value === 'Waiting for verify' ? 'Verified' : 'Approved'
		approvalStatus.value = nextStatus
		isListed.value = nextStatus === 'Approved'
		store.setApprovalStatus(nextStatus)
		await fetchSitterDetail(store.selectedSitterId)
	} catch (error) {
		console.error('Failed to approve pet sitter profile:', error)
		errorMessage.value = 'Unable to approve pet sitter profile.'
	}
}

const formatDate = (value: string | null) => {
	if (!value) return '-'
	return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const fullAddress = () => {
	if (usePendingProfile.value) {
		if (!pendingProfile.value) return ''
		return [pendingProfile.value.addressDetail, pendingProfile.value.subDistrict, pendingProfile.value.district, pendingProfile.value.province, pendingProfile.value.postCode]
			.filter(Boolean)
			.join(', ')
	}
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
						<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ displayFullName ?? store.selectedSitterName ?? displaySitterName ?? 'Unnamed user' }}</h1>
						<span class="flex shrink-0 items-center gap-1.5 text-[10px] text-[#ef82b6]">
							<span class="h-1 w-1 rounded-full bg-current"></span>
							{{ approvalStatus ?? store.selectedSitterStatus ?? 'Waiting for approve' }}
						</span>
					</div>

					<div class="flex items-center gap-3">
						<button type="button" class="rounded-full bg-[#fff4ef] px-5 py-2 text-[9px] font-semibold text-[#f47755] transition hover:bg-[#ffe6dc]" @click="showRejectConfirmation = true">Reject</button>
						<button type="button" class="rounded-full bg-[#ff7040] px-5 py-2 text-[9px] font-semibold text-white transition hover:bg-[#f25d2c]" @click="handleApprove">Approve</button>
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
						<img :src="displayAvatarUrl || '/image/dog2.jpg'" :alt="displayFullName || 'Pet sitter'" class="mx-auto h-32 w-32 rounded-full object-cover md:mx-0" />

						<div v-if="profile?.pet_sitter_state === 2 || profile?.pet_sitter_state === 3" class="rounded-md bg-[#fbfbfd] p-4 sm:p-5">
							<dl class="grid gap-4 sm:grid-cols-2">
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Full Name</dt><dd class="mt-1 text-[10px]">{{ displayFullName || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Experience</dt><dd class="mt-1 text-[10px]">{{ displayExperienceYears || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Phone</dt><dd class="mt-1 text-[10px]">{{ displayPhone || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">ID Number</dt><dd class="mt-1 text-[10px]">{{ displayIdNumber || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Date of Birth</dt><dd class="mt-1 text-[10px]">{{ formatDate(displayDateOfBirth) }}</dd></div>
							</dl>
							<div class="mt-5">
								<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Introduction</h2>
								<p class="mt-1 max-w-3xl text-[10px] leading-[1.55] text-[#30343f]">{{ displayIntroduction || 'No introduction provided.' }}</p>
							</div>
						</div>
					</div>

					<div v-if="profile?.pet_sitter_state === 3" class="mt-6 rounded-md bg-[#fbfbfd] p-4 sm:p-5">
						<div>
							<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Pet sitter name (Trade Name)</h2>
							<p class="mt-1 text-[10px]">{{ displaySitterName || '-' }}</p>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Pet type</h2>
						<div class="mt-2 flex flex-wrap gap-2">
							<span v-for="petTypeName in displayPetTypeNames" :key="petTypeName" class="rounded-full border px-2.5 py-0.5 text-[9px]" :style="{ borderColor: petTypeColor(petTypeName).border, color: petTypeColor(petTypeName).text }">{{ petTypeName }}</span>
							<span v-if="displayPetTypeNames.length === 0" class="text-[9px] text-[#9297a9]">No pet types selected.</span>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Services</h2>
						<div class="mt-2 space-y-2 text-[10px] leading-[1.5]">
							<p>{{ displayServices || 'No services listed.' }}</p>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">My Place</h2>
						<p class="mt-1 text-[10px] leading-[1.5]">{{ displayMyPlace || '-' }}</p>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Image Gallery</h2>
						<div class="mt-2 flex flex-wrap gap-3">
							<img v-for="photoUrl in displayPhotoUrls" :key="photoUrl" :src="photoUrl" alt="Sitter gallery photo" class="h-28 w-40 rounded-md object-cover" />
							<span v-if="displayPhotoUrls.length === 0" class="text-[9px] text-[#9297a9]">No gallery photos uploaded.</span>
						</div>
					</div>

					<div v-if="profile?.pet_sitter_state === 3" class="mt-6 rounded-md bg-[#fbfbfd] p-4 sm:p-5">
						<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Address</h2>
						<p class="mt-1 text-[10px]">{{ fullAddress() || '-' }}</p>
						<div class="mt-5">
							<SitterLocationMap :latitude="displayLatitude" :longitude="displayLongitude" />
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
