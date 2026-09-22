<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const API_BASE_URL = 'http://localhost:8081/api'

type ReportStatus = 'New Report' | 'Pending' | 'Resolved' | 'Canceled'

interface Report {
	id: number
	user: string
	reportedPerson: string
	issue: string
	dateSubmitted: string
	status: ReportStatus
}

// raw shape returned by GET /api/reports (reports joined with bookings, sitter_profiles/users and owner users)
interface ReportAdminListItem {
	id: number
	userName: string | null
	reportedPersonName: string | null
	issue: string
	createdAt: string
	status: string
}

const selectedStatus = ref<'All status' | ReportStatus>('All status')
const reports = ref<Report[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const statusLabel: Record<string, ReportStatus> = {
	new_report: 'New Report',
	pending: 'Pending',
	resolved: 'Resolved',
	canceled: 'Canceled',
}

const formatDate = (value: string) => {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

const mapReport = (item: ReportAdminListItem): Report => ({
	id: item.id,
	user: item.userName ?? 'Unknown',
	reportedPerson: item.reportedPersonName ?? 'Unknown',
	issue: item.issue,
	dateSubmitted: formatDate(item.createdAt),
	status: statusLabel[item.status] ?? 'New Report',
})

const fetchReports = async () => {
	isLoading.value = true
	errorMessage.value = ''
	try {
		const response = await axios.get<ReportAdminListItem[]>(`${API_BASE_URL}/reports`)
		reports.value = response.data.map(mapReport)
	} catch (error) {
		console.error('Failed to fetch reports:', error)
		errorMessage.value = 'Unable to load reports.'
	} finally {
		isLoading.value = false
	}
}

onMounted(fetchReports)

const filteredReports = computed(() => selectedStatus.value === 'All status'
	? reports.value
	: reports.value.filter((report) => report.status === selectedStatus.value))

const statusClass: Record<ReportStatus, string> = {
	'New Report': 'text-[#ef82b6]',
	Pending: 'text-[#57b7ef]',
	Resolved: 'text-[#16c98d]',
	Canceled: 'text-[#ff4242]',
}

const goToDetail = (id: number) => {
	router.push(`/admin/reports/${id}`)
}
</script>

<template>
	<div class="flex min-h-screen bg-[#f7f8fc] text-[#30343f]">
		<AdminSidebar />

		<main class="min-w-0 flex-1 px-5 py-6 sm:px-6 sm:py-7">
			<div class="mx-auto max-w-[1000px]">
				<header class="mb-3 flex items-center justify-between gap-4">
					<h1 class="text-[15px] font-bold text-[#171923]">Report</h1>
					<label class="relative">
						<span class="sr-only">Filter reports by status</span>
						<select v-model="selectedStatus" class="h-[30px] w-[138px] appearance-none rounded-[5px] border border-[#e0e4ed] bg-white px-3 pr-7 text-[9px] text-[#9298ab] outline-none transition focus:border-[#b8bfd0]">
							<option>All status</option>
							<option>New Report</option>
							<option>Pending</option>
							<option>Resolved</option>
							<option>Canceled</option>
						</select>
						<span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-[#9fa6b8]" aria-hidden="true">⌄</span>
					</label>
				</header>

				<section class="overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(40,45,70,0.02)]">
					<p v-if="isLoading" class="px-3 py-10 text-center text-[10px] text-[#9298ab]">Loading reports…</p>
					<p v-else-if="errorMessage" class="px-3 py-10 text-center text-[10px] text-[#ff4242]">{{ errorMessage }}</p>
					<div v-else class="overflow-x-auto">
						<table class="w-full min-w-[680px] table-fixed border-collapse text-left text-[10px] text-[#171923]">
							<caption class="sr-only">Submitted reports</caption>
							<colgroup>
								<col class="w-[17%]" />
								<col class="w-[18%]" />
								<col class="w-[20%]" />
								<col class="w-[25%]" />
								<col class="w-[20%]" />
							</colgroup>
							<thead>
								<tr class="bg-black text-[9px] font-medium text-white">
									<th class="rounded-l-lg px-3 py-2.5 font-medium">User</th>
									<th class="px-3 py-2.5 font-medium">Reported Person</th>
									<th class="px-3 py-2.5 font-medium">Issue</th>
									<th class="px-3 py-2.5 font-medium">Date Submitted</th>
									<th class="rounded-r-lg px-3 py-2.5 font-medium">Status</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="report in filteredReports"
									:key="report.id"
									class="cursor-pointer border-b border-[#e5e8f0] last:border-b-0 hover:bg-[#f7f8fc]"
									@click="goToDetail(report.id)"
								>
									<td class="px-3 py-[15px]">{{ report.user }}</td>
									<td class="px-3 py-[15px]">{{ report.reportedPerson }}</td>
									<td class="truncate px-3 py-[15px]">{{ report.issue }}</td>
									<td class="whitespace-nowrap px-3 py-[15px]">{{ report.dateSubmitted }}</td>
									<td class="whitespace-nowrap px-3 py-[15px]" :class="statusClass[report.status]">
										<span class="mr-1 inline-block h-1 w-1 rounded-full bg-current align-middle"></span>{{ report.status }}
									</td>
								</tr>
								<tr v-if="filteredReports.length === 0">
									<td colspan="5" class="px-3 py-10 text-center text-[10px] text-[#9298ab]">No reports found.</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</main>
	</div>
</template>
