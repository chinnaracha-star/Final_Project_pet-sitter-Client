<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/AdminSidebar.vue'
import { useAdminPetOwnerStore } from '../../stores/adminPetOwner'

interface OwnerReview {
	id: number
	rating: number
	comment: string | null
	createdAt: string
}

interface OwnerReviewsResponse {
	id: string
	name: string | null
	avatarUrl: string | null
	reviews: OwnerReview[]
}

const API_BASE_URL = 'http://localhost:8081/api'

const router = useRouter()
const store = useAdminPetOwnerStore()
const owner = ref<Pick<OwnerReviewsResponse, 'name' | 'avatarUrl'> | null>(null)
const reviews = ref<OwnerReview[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const formatDate = (date: string) =>
	new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))

const fetchOwnerReviews = async (ownerId: string) => {
	isLoading.value = true
	errorMessage.value = ''

	try {
		const response = await axios.get<OwnerReviewsResponse>(`${API_BASE_URL}/admin/owners/${ownerId}`)
		owner.value = { name: response.data.name, avatarUrl: response.data.avatarUrl }
		reviews.value = response.data.reviews || []
	} catch (error) {
		console.error('Failed to fetch pet owner reviews:', error)
		owner.value = null
		reviews.value = []
		errorMessage.value = 'Unable to load this pet owner’s reviews. Please return to the owner list and try again.'
	} finally {
		isLoading.value = false
	}
}

watch(
	() => store.selectedOwnerId,
	(ownerId) => {
		if (!ownerId) {
			router.replace('/admin/owners')
			return
		}
		fetchOwnerReviews(ownerId)
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
					<RouterLink to="/admin/owners/profile" class="text-xl leading-none text-[#9298ab]" aria-label="Back to pet owner profile">‹</RouterLink>
					<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ owner?.name || 'Pet Owner' }}</h1>
				</header>

				<nav class="mt-4 flex gap-2" aria-label="Pet owner sections">
					<RouterLink :to="store.selectedOwnerId ? `/admin/owners/profile/${store.selectedOwnerId}` : '/admin/owners'" class="rounded-t-md bg-[#e2e5f1] px-5 py-3 text-[11px] font-semibold text-[#858b9f] transition hover:bg-[#d9ddeb]">Profile</RouterLink>
					<RouterLink :to="store.selectedOwnerId ? `/admin/owners/profile/${store.selectedOwnerId}/pets` : '/admin/owners'" class="rounded-t-md bg-[#e2e5f1] px-5 py-3 text-[11px] font-semibold text-[#858b9f] transition hover:bg-[#d9ddeb]">Pets</RouterLink>
					<RouterLink to="/admin/owners/profile/reviews" class="rounded-t-md bg-white px-5 py-3 text-[11px] font-semibold text-[#ff7040]">Reviews</RouterLink>
				</nav>

				<section class="rounded-xl bg-white px-5 py-4 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:px-6">
					<div v-if="isLoading" class="py-16 text-center text-xs text-[#9298ab]">Loading reviews...</div>
					<div v-else-if="errorMessage" class="py-16 text-center text-xs text-[#f04444]">{{ errorMessage }}</div>
					<div v-else-if="reviews.length === 0" class="py-16 text-center text-xs text-[#9298ab]">This pet owner has no reviews yet.</div>
					<article v-for="review in reviews" v-else :key="review.id" class="grid gap-3 border-b border-[#e5e8f0] py-5 last:border-b-0 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-4">
						<div class="flex items-start gap-2 sm:justify-center">
							<img :src="owner?.avatarUrl || '/image/dog1.jpg'" :alt="`${owner?.name || 'Pet owner'} avatar`" class="h-8 w-8 shrink-0 rounded-full object-cover" />
							<div>
								<p class="text-[10px] font-semibold text-[#30343f]">{{ owner?.name }}</p>
								<p class="text-[8px] text-[#9298ab]">{{ formatDate(review.createdAt) }}</p>
							</div>
						</div>

						<div class="min-w-0">
							<div class="flex items-center gap-1" :aria-label="`${review.rating} out of 5 stars`">
								<svg v-for="star in 5" :key="star" class="h-[11px] w-[11px]" :class="star <= review.rating ? 'text-[#1ccd83]' : 'text-[#dfe3eb]'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
									<path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z" />
								</svg>
							</div>
							<p class="mt-2 text-[9px] text-[#5d6272]">{{ review.comment }}</p>
						</div>
					</article>
				</section>
			</div>
		</main>
	</div>
</template>
