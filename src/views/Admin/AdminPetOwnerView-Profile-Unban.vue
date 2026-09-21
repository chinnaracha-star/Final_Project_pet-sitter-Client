<script setup lang="ts">
const emit = defineEmits<{
	cancel: []
	confirm: []
}>()
</script>

<template>
	<div class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/65 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="unban-user-title">
		<section class="w-full max-w-[232px] overflow-hidden rounded-[9px] bg-white text-[#171923] shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
			<header class="flex items-center justify-between border-b border-[#e8eaf0] px-[14px] py-[10px]">
				<h1 id="unban-user-title" class="text-[11px] font-semibold text-[#171923]">Unban User</h1>
				<button type="button" class="text-[18px] leading-none text-[#adb4c8] transition hover:text-[#ff7040]" aria-label="Close unban user dialog" @click="emit('cancel')">×</button>
			</header>

			<div class="px-[14px] pb-[14px] pt-[15px]">
				<p class="text-[9px] text-[#7f8498]">Are you sure to unban this user?</p>

				<footer class="mt-[16px] flex items-center justify-between">
					<button type="button" class="rounded-full bg-[#fff0eb] px-[20px] py-[7px] text-[9px] font-semibold text-[#ff7040] transition hover:bg-[#ffe1d8]" @click="emit('cancel')">
						Cancel
					</button>
					<button type="button" class="rounded-full bg-[#ff7040] px-[16px] py-[7px] text-[9px] font-semibold text-white transition hover:bg-[#f25d2c]" @click="emit('confirm')">
						Unban User
					</button>
				</footer>
			</div>
		</section>
	</div>
</template>
