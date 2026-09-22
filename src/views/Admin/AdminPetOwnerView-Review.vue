<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { useAdminPetOwnerStore } from '../../stores/adminPetOwner'

interface OwnerReview {
	id: number
	name: string
	date: string
	rating: number
	comment: string
	avatar: string
}

const owner = { name: 'John Wick' }
const store = useAdminPetOwnerStore()

const reviews: OwnerReview[] = [
	{ id: 1, name: 'Jane Maison', date: 'Aug 16, 2023', rating: 4, comment: 'Nice customer, with good bois!', avatar: '/image/dog1.jpg' },
	{ id: 2, name: 'Emily B.', date: 'Aug 16, 2023', rating: 5, comment: 'His cat is so cute', avatar: '/image/cat.jpg' },
]
</script>

<template>
	<div class="flex min-h-screen bg-[#f7f8fc] text-[#30343f]">
		<AdminSidebar />

		<main class="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-7">
			<div class="mx-auto max-w-[1000px]">
				<header class="flex items-center gap-3 px-1">
					<RouterLink to="/admin/owners/profile" class="text-xl leading-none text-[#9298ab]" aria-label="Back to pet owner profile">‹</RouterLink>
					<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ owner.name }}</h1>
				</header>

				<nav class="mt-4 flex gap-2" aria-label="Pet owner sections">
					<RouterLink :to="store.selectedOwnerId ? `/admin/owners/profile/${store.selectedOwnerId}` : '/admin/owners'" class="rounded-t-md bg-[#e2e5f1] px-5 py-3 text-[11px] font-semibold text-[#858b9f] transition hover:bg-[#d9ddeb]">Profile</RouterLink>
					<RouterLink :to="store.selectedOwnerId ? `/admin/owners/profile/${store.selectedOwnerId}/pets` : '/admin/owners'" class="rounded-t-md bg-[#e2e5f1] px-5 py-3 text-[11px] font-semibold text-[#858b9f] transition hover:bg-[#d9ddeb]">Pets</RouterLink>
					<RouterLink to="/admin/owners/profile/reviews" class="rounded-t-md bg-white px-5 py-3 text-[11px] font-semibold text-[#ff7040]">Reviews</RouterLink>
				</nav>

				<section class="rounded-xl bg-white px-5 py-4 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:px-6">
					<article v-for="review in reviews" :key="review.id" class="grid gap-3 border-b border-[#e5e8f0] py-5 last:border-b-0 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-4">
						<div class="flex items-start gap-2 sm:justify-center">
							<img :src="review.avatar" :alt="`${review.name} avatar`" class="h-8 w-8 shrink-0 rounded-full object-cover" />
							<div>
								<p class="text-[10px] font-semibold text-[#30343f]">{{ review.name }}</p>
								<p class="text-[8px] text-[#9298ab]">{{ review.date }}</p>
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
