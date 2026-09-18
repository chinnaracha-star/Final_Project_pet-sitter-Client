<script setup lang="ts">
import { ref } from 'vue'
import AdminSidebar from '../../components/AdminSidebar.vue'

type ReportStatus = 'New Report' | 'Pending' | 'Resolved' | 'Canceled'

const props = withDefaults(defineProps<{
	issue?: string
	reportedBy?: string
	reportedPerson?: string
	description?: string
	dateSubmitted?: string
	status?: ReportStatus
}>(), {
	issue: 'My daisy look sad..',
	reportedBy: 'John Wick',
	reportedPerson: 'Jane Maison',
	description: 'After take Daisy home, she look a little bit sad, maybe something bad happen at pet sitter place?',
	dateSubmitted: '25 Aug, 2023',
	status: 'Pending',
})

const currentStatus = ref<ReportStatus>(props.status ?? 'Pending')

const emit = defineEmits<{
	'cancel-report': []
	resolve: []
}>()

const cancelReport = () => {
	currentStatus.value = 'Canceled'
	emit('cancel-report')
}

const resolveReport = () => {
	currentStatus.value = 'Resolved'
	emit('resolve')
}

const statusClass: Record<ReportStatus, string> = {
	'New Report': 'text-[#ef82b6]',
	Pending: 'text-[#57b7ef]',
	Resolved: 'text-[#16c98d]',
	Canceled: 'text-[#ff4242]',
}
</script>

<template>
	<div class="flex min-h-screen bg-[#f7f8fc] text-[#30343f]">
		<AdminSidebar />

		<main class="min-w-0 flex-1 px-5 py-6 sm:px-6 sm:py-7">
			<div class="mx-auto max-w-[1000px]">
				<header class="mb-3 flex flex-wrap items-center justify-between gap-4 px-1">
					<div class="flex min-w-0 items-center gap-3">
						<RouterLink to="/admin/reports" class="text-xl leading-none text-[#9298ab]" aria-label="Back to reports">‹</RouterLink>
						<h1 class="max-w-[260px] truncate text-[14px] font-bold text-[#252733]">{{ issue }}</h1>
						<span class="flex shrink-0 items-center gap-1.5 text-[9px]" :class="statusClass[currentStatus]">
							<span class="h-1 w-1 rounded-full bg-current"></span>
							{{ currentStatus }}
						</span>
					</div>

					<div class="flex items-center gap-2">
						<button type="button" class="rounded-full bg-[#fff0eb] px-4 py-2 text-[9px] font-semibold text-[#ff7040] transition hover:bg-[#ffe1d8]" @click="cancelReport">Cancel Report</button>
						<button type="button" class="rounded-full bg-[#ff7040] px-5 py-2 text-[9px] font-semibold text-white transition hover:bg-[#f25d2c]" @click="resolveReport">Resolve</button>
					</div>
				</header>

				<section class="rounded-xl bg-white px-6 py-6 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:px-7 sm:py-7">
					<dl class="divide-y divide-[#e5e8f0] text-[10px]">
						<div class="pb-3">
							<dt class="font-semibold text-[#adb3c8]">Reported by</dt>
							<dd class="mt-1 text-[#30343f]">{{ reportedBy }}</dd>
						</div>
						<div class="py-5">
							<dt class="font-semibold text-[#adb3c8]">Reported Person</dt>
							<dd class="mt-1 text-[#30343f]">{{ reportedPerson }}</dd>
						</div>
						<div class="py-5">
							<dt class="font-semibold text-[#adb3c8]">Issue</dt>
							<dd class="mt-1 text-[#30343f] italic">{{ issue }}</dd>
						</div>
						<div class="py-5">
							<dt class="font-semibold text-[#adb3c8]">Description</dt>
							<dd class="mt-1 leading-[1.6] text-[#30343f]">{{ description }}</dd>
						</div>
						<div class="pt-5">
							<dt class="font-semibold text-[#adb3c8]">Date Submitted</dt>
							<dd class="mt-1 text-[#30343f]">{{ dateSubmitted }}</dd>
						</div>
					</dl>
				</section>
			</div>
		</main>
	</div>
</template>
