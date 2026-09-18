<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { useAdminPetSitterStore } from '../../stores/adminPetSitter'

const store = useAdminPetSitterStore()

interface Review {
	id: number
	name: string
	date: string
	rating: number
	comment: string
	avatar: string
}

const reviews: Review[] = [
	{
		id: 1,
		name: 'David M.',
		date: 'Aug 16, 2023',
		rating: 4,
		comment: 'I recently had the pleasure of entrusting Jane Maison with the care of my two energetic Labrador Retrievers, Max and Bella, while I was away on a business trip. I can confidently say that Jane exceeded all my expectations as a pet sitter.',
		avatar: '/image/dog1.jpg',
	},
	{
		id: 2,
		name: 'Emily B.',
		date: 'Aug 16, 2023',
		rating: 5,
		comment: 'I cannot express how grateful I am to have found Jane Maison as a pet sitter for my cat, Whiskers. Jane took the time to understand Whiskers’ routines, likes, and quirks. During my recent vacation, she provided regular updates, including photos of Whiskers playing, lounging, and even eating his favorite treats.',
		avatar: '/image/cat.jpg',
	},
	{
		id: 3,
		name: 'Emily B.',
		date: 'Aug 16, 2023',
		rating: 5,
		comment: 'Jane Maison did a great job looking after my energetic dog, Buddy. While I was away, she made sure Buddy got his exercise and kept up with his feeding schedule. I appreciated the updates she sent, although I would have liked a bit more frequent communication.',
		avatar: '/image/dog2.jpg',
	},
	{
		id: 4,
		name: 'Emily B.',
		date: 'Aug 16, 2023',
		rating: 4,
		comment: 'Jane Maison is a lifesaver! She took care of my rambunctious rabbit, Floppy, while I was away on vacation. Floppy can be quite picky, but Jane knew just how to keep her happy and entertained. I received adorable photos of Floppy munching on her favorite greens and exploring new play areas.',
		avatar: '/image/blackcat.jpg',
	},
	{
		id: 5,
		name: 'Emily B.',
		date: 'Aug 16, 2023',
		rating: 4,
		comment: 'Jane Maison took care of my cat during my vacation. While my cat seemed fine when I returned, I wish there had been more communication and updates about his well-being.',
		avatar: '/image/bird.jpg',
	},
]

const removeReview = (id: number) => {
	console.info(`Review ${id} marked for removal`)
}

const approveReview = (id: number) => {
	console.info(`Review ${id} approved`)
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
						<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ store.selectedSitterName ?? 'Jane Maison' }}</h1>
					</div>
				</header>

				<nav class="mt-4 flex gap-2" aria-label="Sitter profile sections">
					<RouterLink
						:to="{ path: '/admin/petsitters/profile', query: { id: store.selectedSitterId ?? undefined } }"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="store.activeTab === 'Profile' ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="store.activeTab = 'Profile'"
					>
						Profile
					</RouterLink>
					<RouterLink
						:to="{ path: '/admin/petsitters/profile/booking', query: { id: store.selectedSitterId ?? undefined } }"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="store.activeTab === 'Booking' ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="store.activeTab = 'Booking'"
					>
						Booking
					</RouterLink>
					<button
						type="button"
						class="rounded-t-md bg-white px-5 py-3 text-[11px] font-semibold text-[#ff7040] transition"
						@click="store.activeTab = 'Reviews'"
					>
						Reviews
					</button>
				</nav>

				<section class="rounded-xl bg-white px-4 py-3 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:px-5">
					<article v-for="review in reviews" :key="review.id" class="grid gap-3 border-b border-[#e5e8f0] py-5 last:border-b-0 sm:grid-cols-[80px_minmax(0,1fr)_70px] sm:gap-4">
						<div class="flex items-start gap-2 sm:justify-center">
							<img :src="review.avatar" :alt="`${review.name} avatar`" class="h-7 w-7 shrink-0 rounded-full object-cover" />
							<div class="min-w-0 sm:hidden">
								<p class="truncate text-[10px] font-semibold text-[#30343f]">{{ review.name }}</p>
								<p class="text-[8px] text-[#9298ab]">{{ review.date }}</p>
							</div>
						</div>

						<div class="min-w-0">
							<div class="hidden sm:block">
								<p class="text-[9px] font-semibold text-[#30343f]">{{ review.name }}</p>
								<p class="text-[8px] text-[#9298ab]">{{ review.date }}</p>
							</div>
							<div class="mt-1 flex items-center gap-2">
								<div class="flex items-center gap-0.5" :aria-label="`${review.rating} out of 5 stars`">
									<svg v-for="star in 5" :key="star" class="h-[11px] w-[11px]" :class="star <= review.rating ? 'text-[#1ccd83]' : 'text-[#dfe3eb]'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
										<path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z" />
									</svg>
								</div>
							</div>
							<p class="mt-1 max-w-[610px] text-[8px] leading-[1.65] text-[#5d6272]">{{ review.comment }}</p>
						</div>

						<div class="flex items-start justify-start gap-2 sm:justify-end">
							<button type="button" class="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5f6fa] text-[#b9bfce] transition hover:bg-[#ffe9e2] hover:text-[#ff7040]" :aria-label="`Remove review by ${review.name}`" @click="removeReview(review.id)">
								<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M8 7l1-2h6l1 2m-9 0 1 13h8l1-13" /></svg>
							</button>
							<button type="button" class="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff0eb] text-[#ff7040] transition hover:bg-[#ff7040] hover:text-white" :aria-label="`Approve review by ${review.name}`" @click="approveReview(review.id)">
								<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
							</button>
						</div>
					</article>

					<nav class="flex items-center justify-center gap-5 py-3 text-[9px] text-[#aeb4c5]" aria-label="Review pagination">
						<button type="button" class="text-[#b8bfd0] transition hover:text-[#ff7040]" aria-label="Previous page">‹</button>
						<button type="button" class="flex h-4 w-4 items-center justify-center rounded-full bg-[#fff0eb] text-[#ff7040]" aria-current="page">1</button>
						<button type="button" class="transition hover:text-[#ff7040]">2</button>
						<button type="button" class="text-[#b8bfd0] transition hover:text-[#ff7040]" aria-label="Next page">›</button>
					</nav>
				</section>
			</div>
		</main>
	</div>
</template>
