<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '../../services/adminApi'
import AdminSidebar from '../../components/AdminSidebar.vue'
import AdminPetSitterViewReportResolve from './AdminPetSitterView-Report-Resolve.vue'
import AdminPetSitterViewReportCancel from './AdminPetSitterView-Report-Cancel.vue'

const route = useRoute()
const router = useRouter()

type ReportStatus = 'New Report' | 'Pending' | 'Resolved' | 'Canceled'

// raw shape returned by GET /api/reports/{id} (reports joined with bookings, sitter_profiles/users and owner users)
interface ReportAdminListItem {
	id: number
	userName: string | null
	reportedPersonName: string | null
	issue: string
	description: string | null
	createdAt: string
	status: string
}

const statusLabel: Record<string, ReportStatus> = {
	new_report: 'New Report',
	pending: 'Pending',
	resolved: 'Resolved',
	canceled: 'Canceled',
}

const reportedBy = ref('')
const reportedPerson = ref('')
const issue = ref('')
const description = ref('')
const dateSubmitted = ref('')
const currentStatus = ref<ReportStatus>('Pending')
const isLoading = ref(false)
const errorMessage = ref('')
const showResolveConfirm = ref(false)
const showCancelConfirm = ref(false)

const formatDate = (value: string) => {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

const applyReport = (item: ReportAdminListItem) => {
	reportedBy.value = item.userName ?? 'Unknown'
	reportedPerson.value = item.reportedPersonName ?? 'Unknown'
	issue.value = item.issue
	description.value = item.description ?? ''
	dateSubmitted.value = formatDate(item.createdAt)
	currentStatus.value = statusLabel[item.status] ?? 'New Report'
}

const fetchReport = async (id: string) => {
	isLoading.value = true
	errorMessage.value = ''
	try {
		const response = await adminApi.get<ReportAdminListItem>(`/reports/${id}`)
		applyReport(response.data)
	} catch (error) {
		console.error('Failed to fetch report:', error)
		errorMessage.value = 'Unable to load report.'
	} finally {
		isLoading.value = false
	}
}

onMounted(() => {
	const id = route.params.id
	if (typeof id === 'string') fetchReport(id)
})

watch(
	() => route.params.id,
	(id) => {
		if (typeof id === 'string') fetchReport(id)
	},
)

const cancelReport = async () => {
	const id = route.params.id
	if (typeof id !== 'string') return
	try {
		await adminApi.delete(`/reports/${id}`)
		router.push('/admin/reports')
	} catch (error) {
		console.error('Failed to delete report:', error)
		errorMessage.value = 'Unable to delete report.'
	} finally {
		showCancelConfirm.value = false
	}
}

const dismissCancelConfirm = () => {
	showCancelConfirm.value = false
}

const resolveReport = async () => {
	const id = route.params.id
	if (typeof id !== 'string') return
	try {
		const response = await adminApi.patch<ReportAdminListItem>(`/reports/${id}/resolve`)
		applyReport(response.data)
	} catch (error) {
		console.error('Failed to resolve report:', error)
		errorMessage.value = 'Unable to resolve report.'
	} finally {
		showResolveConfirm.value = false
	}
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
						<button type="button" class="rounded-full bg-[#fff0eb] px-4 py-2 text-[9px] font-semibold text-[#ff7040] transition hover:bg-[#ffe1d8]" @click="showCancelConfirm = true">Cancel Report</button>
						<button type="button" class="rounded-full bg-[#ff7040] px-5 py-2 text-[9px] font-semibold text-white transition hover:bg-[#f25d2c]" @click="showResolveConfirm = true">Resolve</button>
					</div>
				</header>

				<section class="rounded-xl bg-white px-6 py-6 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:px-7 sm:py-7">
					<p v-if="isLoading" class="text-[10px] text-[#9298ab]">Loading report…</p>
					<p v-else-if="errorMessage" class="text-[10px] text-[#ff4242]">{{ errorMessage }}</p>
					<dl v-else class="divide-y divide-[#e5e8f0] text-[10px]">
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

		<AdminPetSitterViewReportResolve
			v-if="showResolveConfirm"
			@cancel="showResolveConfirm = false"
			@confirm="resolveReport"
		/>

		<AdminPetSitterViewReportCancel
			v-if="showCancelConfirm"
			@cancel="dismissCancelConfirm"
			@confirm="cancelReport"
		/>
	</div>
</template>
