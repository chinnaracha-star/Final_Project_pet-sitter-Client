<script setup lang="ts">
interface PetDetail {
	name: string
	type: string
	image: string
}

withDefaults(defineProps<{
	ownerName?: string
	pets?: PetDetail[]
	duration?: string
	bookingDate?: string
	totalPaid?: string
}>(), {
	ownerName: 'John Wick',
	pets: () => [
		{ name: 'Bubba', type: 'Dog', image: '/image/dog1.jpg' },
		{ name: 'Daisy', type: 'Dog', image: '/image/dog2.jpg' },
	],
	duration: '3 hours',
	bookingDate: '16 Oct 2022  |  7 AM - 10 AM',
	totalPaid: '900.00 THB',
})

const emit = defineEmits<{
	close: []
}>()
</script>

<template>
	<div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/65 px-4 py-8" role="dialog" aria-modal="true" :aria-label="`${ownerName} booking detail`">
		<section class="flex max-h-[calc(100vh-4rem)] w-full max-w-[472px] flex-col overflow-hidden rounded-[9px] bg-white text-[#171923] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
			<header class="flex shrink-0 items-center justify-between border-b border-[#e9ebf1] px-6 py-[15px]">
				<h1 class="text-[14px] font-bold text-[#373a48]">{{ ownerName }}</h1>
				<button type="button" class="text-[22px] leading-none text-[#3f4350] transition hover:text-[#ff7040]" aria-label="Close booking detail" @click="emit('close')">×</button>
			</header>

			<div class="overflow-y-auto px-6 py-6">
				<dl class="space-y-4 text-[10px]">
					<div>
						<dt class="font-semibold text-[#adb3c8]">Pet Owner Name</dt>
						<dd class="mt-1 text-[#15171d]">{{ ownerName }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Pet(s)</dt>
						<dd class="mt-1 text-[#15171d]">{{ pets.length }}</dd>
					</div>
				</dl>

				<div class="mt-5">
					<h2 class="text-[10px] font-semibold text-[#adb3c8]">Pet Detail</h2>
					<div class="mt-1 flex flex-wrap gap-2">
						<article v-for="pet in pets" :key="pet.name" class="flex h-[140px] w-[122px] flex-col items-center rounded-[9px] border border-[#e3e6ef] px-2 py-3">
							<img :src="pet.image" :alt="pet.name" class="h-[59px] w-[59px] rounded-full object-cover" />
							<h3 class="mt-3 text-[12px] font-bold text-[#4a4d5b]">{{ pet.name }}</h3>
							<span class="mt-1 rounded-full border border-[#50d9a8] px-2.5 py-0.5 text-[9px] text-[#22c993]">{{ pet.type }}</span>
						</article>
					</div>
				</div>

				<dl class="mt-4 space-y-4 text-[10px]">
					<div>
						<dt class="font-semibold text-[#adb3c8]">Duration</dt>
						<dd class="mt-1 text-[#15171d]">{{ duration }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Booking Date</dt>
						<dd class="mt-1 text-[#15171d]">{{ bookingDate }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Total Paid</dt>
						<dd class="mt-1 text-[#15171d]">{{ totalPaid }}</dd>
					</div>
				</dl>
			</div>
		</section>
	</div>
</template>
