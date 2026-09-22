<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
	cancel: []
	reject: [reason: string]
}>()

const reason = ref('')
const showReasonWarning = ref(false)

const handleReject = () => {
	if (!reason.value.trim()) {
		showReasonWarning.value = true
		return
	}
	showReasonWarning.value = false
	emit('reject', reason.value)
}
</script>

<template>
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
		<div class="w-full max-w-[420px] rounded-lg bg-white shadow-xl">
			<header class="flex items-center justify-between border-b border-[#e5e7ef] px-5 py-4">
				<h2 class="text-[13px] font-bold text-[#242633]">Reject Confirmation</h2>
				<button type="button" class="text-[#a2a6b5] transition hover:text-[#242633]" aria-label="Close" @click="emit('cancel')">
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true">
						<path d="m6 6 12 12M18 6 6 18" />
					</svg>
				</button>
			</header>

			<div class="px-5 py-4">
				<label class="block text-[11px] font-semibold text-[#242633]" for="reject-reason">Reason and suggestion</label>
				<textarea
					id="reject-reason"
					v-model="reason"
					rows="4"
					placeholder="Admin's suggestion here"
					class="mt-2 w-full resize-none rounded-md border border-[#e0e3ed] px-3 py-2 text-[11px] text-[#30343f] outline-none placeholder:text-[#c2c5d1] focus:border-[#afb5ca]"
				></textarea>
				<p v-if="showReasonWarning" class="mt-1.5 text-[10px] font-semibold text-[#f04444]">Please fill in a reason before rejecting.</p>
			</div>

			<footer class="flex items-center justify-between px-5 pb-5">
				<button type="button" class="rounded-full bg-[#fff4ef] px-6 py-2.5 text-[10px] font-semibold text-[#f47755] transition hover:bg-[#ffe6dc]" @click="emit('cancel')">
					Cancel
				</button>
				<button type="button" class="rounded-full bg-[#ff7040] px-6 py-2.5 text-[10px] font-semibold text-white transition hover:bg-[#f25d2c]" @click="handleReject">
					Reject
				</button>
			</footer>
		</div>
	</div>
</template>
