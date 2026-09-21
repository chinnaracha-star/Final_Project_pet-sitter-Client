<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'

type PetType = 'Dog' | 'Cat' | 'Bird'

interface Pet {
	name: string
	type: PetType
	image: string
}

const owner = { name: 'John Wick' }

const pets: Pet[] = [
	{ name: 'Bubba', type: 'Dog', image: '/image/dog1.jpg' },
	{ name: 'Daisy', type: 'Dog', image: '/image/dog2.jpg' },
	{ name: 'I Som', type: 'Cat', image: '/image/cat.jpg' },
	{ name: 'Noodle Birb', type: 'Bird', image: '/image/bird.jpg' },
]

const typeClass: Record<PetType, string> = {
	Dog: 'border-[#50d9a8] text-[#22c993]',
	Cat: 'border-[#f38ab8] text-[#ed71a7]',
	Bird: 'border-[#78c7f1] text-[#4eafe7]',
}
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
					<RouterLink to="/admin/owners/profile" class="rounded-t-md bg-[#e2e5f1] px-5 py-3 text-[11px] font-semibold text-[#858b9f] transition hover:bg-[#d9ddeb]">Profile</RouterLink>
					<RouterLink to="/admin/owners/profile/pets" class="rounded-t-md bg-white px-5 py-3 text-[11px] font-semibold text-[#ff7040]">Pets</RouterLink>
					<button type="button" class="rounded-t-md bg-[#e2e5f1] px-5 py-3 text-[11px] font-semibold text-[#858b9f] transition hover:bg-[#d9ddeb]">Reviews</button>
				</nav>

				<section class="min-h-[455px] rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:p-6">
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
						<article v-for="pet in pets" :key="pet.name" class="flex h-[133px] flex-col items-center rounded-[9px] border border-[#e1e5ee] px-3 py-3">
							<img :src="pet.image" :alt="pet.name" class="h-[59px] w-[59px] rounded-full object-cover" />
							<h2 class="mt-2 text-[12px] font-bold text-[#4a4d5b]">{{ pet.name }}</h2>
							<span class="mt-1 rounded-full border px-2.5 py-0.5 text-[9px]" :class="typeClass[pet.type]">{{ pet.type }}</span>
						</article>
					</div>
				</section>
			</div>
		</main>
	</div>
</template>
