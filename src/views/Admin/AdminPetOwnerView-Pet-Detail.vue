<script setup lang="ts">
interface PetDetail {
	name: string
	image: string
	type: string
	breed: string
	sex: string
	age: string
	color: string
	weight: string
	about: string
}

const props = withDefaults(defineProps<Partial<PetDetail>>(), {
	name: 'Daisy',
	image: '/image/dog2.jpg',
	type: 'Dog',
	breed: 'Beagle',
	sex: 'Female',
	age: '0.6 Month',
	color: 'White, black and brown',
	weight: '2 Kilogram',
	about: 'Woof Woof',
})

const emit = defineEmits<{
	close: []
	suspend: []
}>()
</script>

<template>
	<div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/65 px-4 py-8" role="dialog" aria-modal="true" :aria-label="`${props.name} pet detail`">
		<section class="w-full max-w-[442px] overflow-hidden rounded-[9px] bg-white text-[#171923] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
			<header class="flex items-center justify-between border-b border-[#e9ebf1] px-6 py-[14px]">
				<h1 class="text-[14px] font-bold text-[#373a48]">{{ props.name }}</h1>
				<button type="button" class="text-[21px] leading-none text-[#3f4350] transition hover:text-[#ff7040]" aria-label="Close pet detail" @click="emit('close')">×</button>
			</header>

			<div class="grid gap-5 px-5 py-5 sm:grid-cols-[140px_minmax(0,1fr)] sm:px-6 sm:py-5">
				<div class="flex flex-col items-center">
					<img :src="props.image" :alt="props.name" class="h-[133px] w-[133px] rounded-full object-cover" />
					<h2 class="mt-2 text-[12px] font-bold text-[#171923]">{{ props.name }}</h2>
				</div>

				<dl class="grid grid-cols-2 gap-x-7 gap-y-5 rounded-md bg-[#fbfbfd] px-3.5 py-4 text-[10px]">
					<div>
						<dt class="font-semibold text-[#adb3c8]">Pet Type</dt>
						<dd class="mt-1 text-[#30343f]">{{ props.type }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Breed</dt>
						<dd class="mt-1 text-[#30343f]">{{ props.breed }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Sex</dt>
						<dd class="mt-1 text-[#30343f]">{{ props.sex }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Age</dt>
						<dd class="mt-1 text-[#30343f]">{{ props.age }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Color</dt>
						<dd class="mt-1 text-[#30343f]">{{ props.color }}</dd>
					</div>
					<div>
						<dt class="font-semibold text-[#adb3c8]">Weight</dt>
						<dd class="mt-1 text-[#30343f]">{{ props.weight }}</dd>
					</div>
					<div class="col-span-2">
						<dt class="font-semibold text-[#adb3c8]">About</dt>
						<dd class="mt-1 text-[#30343f]">{{ props.about }}</dd>
					</div>
				</dl>
			</div>

			<footer class="flex justify-end px-6 pb-5">
				<button type="button" class="text-[9px] font-semibold text-[#ff7040] transition hover:text-[#f25d2c]" @click="emit('suspend')">Suspend This Pet</button>
			</footer>
		</section>
	</div>
</template>
