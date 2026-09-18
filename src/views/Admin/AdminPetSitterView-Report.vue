<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { computed, ref } from 'vue'

type ReportStatus = 'New Report' | 'Pending' | 'Resolved' | 'Canceled'

interface Report {
	id: number
	user: string
	reportedPerson: string
	issue: string
	dateSubmitted: string
	status: ReportStatus
}

const selectedStatus = ref<'All status' | ReportStatus>('All status')

const reports: Report[] = [
	{ id: 1, user: 'John Wick', reportedPerson: 'Jane Maison', issue: 'My daisy look sad..', dateSubmitted: '25 Aug, 2023', status: 'New Report' },
	{ id: 2, user: 'John Wick', reportedPerson: 'Jane Maison', issue: 'My daisy look sad..', dateSubmitted: '25 Aug, 2023', status: 'New Report' },
	{ id: 3, user: 'John Wick', reportedPerson: 'Jane Maison', issue: 'My daisy look sad..', dateSubmitted: '25 Aug, 2023', status: 'Pending' },
	{ id: 4, user: 'John Wick', reportedPerson: 'Jane Maison', issue: 'My daisy look sad..', dateSubmitted: '25 Aug, 2023', status: 'Pending' },
	{ id: 5, user: 'John Wick', reportedPerson: 'Jane Maison', issue: 'My daisy look sad..', dateSubmitted: '25 Aug, 2023', status: 'Resolved' },
	{ id: 6, user: 'John Wick', reportedPerson: 'Jane Maison', issue: 'My daisy look sad..', dateSubmitted: '25 Aug, 2023', status: 'Canceled' },
	{ id: 7, user: 'John Wick', reportedPerson: 'Jane Maison', issue: 'My daisy look sad..', dateSubmitted: '25 Aug, 2023', status: 'Resolved' },
]

const filteredReports = computed(() => selectedStatus.value === 'All status'
	? reports
	: reports.filter((report) => report.status === selectedStatus.value))

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
					<div class="overflow-x-auto">
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
								<tr v-for="report in filteredReports" :key="report.id" class="border-b border-[#e5e8f0] last:border-b-0">
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
