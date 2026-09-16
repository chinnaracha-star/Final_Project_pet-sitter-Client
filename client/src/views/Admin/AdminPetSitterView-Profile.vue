<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useAdminPetSitterStore, type SitterStatus, type AdminTab } from '../../stores/adminPetSitter'

const store = useAdminPetSitterStore()
const route = useRoute()

const API_BASE_URL = 'http://localhost:8081/api'

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
	approvalStatus: SitterStatus
}

interface SitterProfileDetailResponse {
	sitterProfile: SitterProfileDetail
	user: SitterUser
	petTypes: PetType[]
}

const profile = ref<SitterProfileDetail | null>(null)
const sitterUser = ref<SitterUser | null>(null)
const petTypes = ref<PetType[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const fetchSitterDetail = async (id: string) => {
	isLoading.value = true
	errorMessage.value = ''
	try {
		const response = await axios.get<SitterProfileDetailResponse>(`${API_BASE_URL}/sitterprofile/${id}`)
		profile.value = response.data.sitterProfile
		sitterUser.value = response.data.user
		petTypes.value = response.data.petTypes || []
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

const setApprovalStatus = (status: Exclude<SitterStatus, 'Waiting for approve'>) => {
	if (store.selectedSitterId !== null) store.setApprovalStatus(status)
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
						<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ sitterUser?.name ?? store.selectedSitterName ?? profile?.displayName ?? 'Unnamed user' }}</h1>
						<span class="flex shrink-0 items-center gap-1.5 text-[10px] text-[#ef82b6]">
							<span class="h-1 w-1 rounded-full bg-current"></span>
							{{ profile?.approvalStatus ?? store.selectedSitterStatus ?? 'Waiting for approve' }}
						</span>
					</div>

					<div class="flex items-center gap-3">
						<button type="button" class="rounded-full bg-[#fff4ef] px-5 py-2 text-[9px] font-semibold text-[#f47755] transition hover:bg-[#ffe6dc]" @click="setApprovalStatus('Rejected')">Reject</button>
						<button type="button" class="rounded-full bg-[#ff7040] px-5 py-2 text-[9px] font-semibold text-white transition hover:bg-[#f25d2c]" @click="setApprovalStatus('Approved')">Approve</button>
					</div>
				</header>

				<nav class="mt-4 flex gap-2" aria-label="Sitter profile sections">
					<button
						v-for="tab in (['Profile', 'Booking', 'Reviews', 'Report'] as AdminTab[])"
						:key="tab"
						type="button"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="store.activeTab === tab ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="store.activeTab = tab"
					>
						{{ tab }}
					</button>
				</nav>

				<div v-if="isLoading" class="mt-4 rounded-xl bg-white p-8 text-center text-[10px] text-[#9297a9] shadow-[0_1px_3px_rgba(40,45,70,0.02)]">Loading pet sitter profile...</div>
				<div v-else-if="errorMessage" class="mt-4 rounded-xl bg-white p-8 text-center text-[10px] text-[#f04444] shadow-[0_1px_3px_rgba(40,45,70,0.02)]">{{ errorMessage }}</div>

				<section v-else-if="store.activeTab === 'Profile'" class="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:p-7">
					<div class="grid gap-7 md:grid-cols-[125px_minmax(0,1fr)]">
						<img :src="sitterUser?.avatarUrl || '/image/dog2.jpg'" :alt="sitterUser?.name || 'Pet sitter'" class="mx-auto h-32 w-32 rounded-full object-cover md:mx-0" />

						<div class="rounded-md bg-[#fbfbfd] p-4 sm:p-5">
							<dl class="grid gap-4 sm:grid-cols-2">
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Full Name</dt><dd class="mt-1 text-[10px]">{{ sitterUser?.name || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Experience</dt><dd class="mt-1 text-[10px]">{{ profile?.experienceYears || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Phone</dt><dd class="mt-1 text-[10px]">{{ sitterUser?.phone || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">ID Number</dt><dd class="mt-1 text-[10px]">{{ sitterUser?.idNumber || '-' }}</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Date of Birth</dt><dd class="mt-1 text-[10px]">{{ formatDate(sitterUser?.dateOfBirth ?? null) }}</dd></div>
							</dl>
							<div class="mt-5">
								<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Introduction</h2>
								<p class="mt-1 max-w-3xl text-[10px] leading-[1.55] text-[#30343f]">{{ profile?.introduction || 'No introduction provided.' }}</p>
							</div>
						</div>
					</div>

					<div class="mt-6 rounded-md bg-[#fbfbfd] p-4 sm:p-5">
						<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Pet sitter name (Trade Name)</h2>
						<p class="mt-1 text-[10px]">{{ profile?.displayName || '-' }}</p>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Pet type</h2>
						<div class="mt-2 flex flex-wrap gap-2">
							<span v-for="petType in petTypes" :key="petType.id" class="rounded-full border border-[#6fe0bc] px-2.5 py-0.5 text-[9px] text-[#20c995]">{{ petType.name }}</span>
							<span v-if="petTypes.length === 0" class="text-[9px] text-[#9297a9]">No pet types selected.</span>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Services</h2>
						<div class="mt-2 space-y-2 text-[10px] leading-[1.5]">
							<p>{{ profile?.services || 'No services listed.' }}</p>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">My Place</h2>
						<p class="mt-1 text-[10px] leading-[1.5]">{{ profile?.myPlace || '-' }}</p>
					</div>

					<div class="mt-6 rounded-md bg-[#fbfbfd] p-4 sm:p-5">
						<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Address</h2>
						<p class="mt-1 text-[10px]">{{ fullAddress() || '-' }}</p>
						<div class="relative mt-5 h-52 overflow-hidden rounded-md bg-[#e5e9e9] bg-[linear-gradient(25deg,transparent_48%,#f4b93c_49%,#f4b93c_51%,transparent_52%),linear-gradient(105deg,transparent_45%,#f7c746_46%,#f7c746_48%,transparent_49%),linear-gradient(160deg,transparent_50%,#b7dbbf_51%,#b7dbbf_64%,transparent_65%)] bg-[length:220px_170px,180px_200px,240px_220px]">
							<div class="absolute left-[52%] top-[48%] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ff7040] shadow-lg">
								<img src="/image/Map_Pin_Selected.svg" alt="Location" class="h-6 w-6 brightness-0 invert" />
							</div>
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
