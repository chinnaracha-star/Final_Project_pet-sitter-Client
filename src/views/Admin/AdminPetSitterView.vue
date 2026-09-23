<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { onUnmounted, ref, watch } from 'vue'
import axios from 'axios'
import { useAdminPetSitterStore } from '../../stores/adminPetSitter'
import { API_BASE_URL } from '../../config/api'

type SitterStatus =
  | 'Unverified'
  | 'Waiting for verify'
  | 'Verified'
  | 'Waiting for approve'
  | 'Approved'
  | 'Rejected'

interface SitterUser {
  name: string | null
  email: string
  avatarUrl: string | null
}

interface SitterProfile {
  userId: string
  user: SitterUser
  displayName: string
  approvalStatus: SitterStatus
}

interface SitterProfilePageResponse {
  sitters: SitterProfile[]
  currentPage: number
  totalPages: number
  totalItems: number
  limit: number
}

const store = useAdminPetSitterStore()

const sitters = ref<SitterProfile[]>([])
const searchQuery = ref('')
const debouncedSearch = ref('')
const selectedStatus = ref<'All status' | SitterStatus>('All status')
const isLoading = ref(false)
const errorMessage = ref('')

const page = ref(1)
const totalPages = ref(1)
const limit = 10

// Debounce search input so a request isn't fired on every keystroke
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (newValue) => {
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    debouncedSearch.value = newValue
  }, 300)
})

// Reset to first page whenever the search or status filter changes
watch([debouncedSearch, selectedStatus], () => {
  page.value = 1
})

// Cancel the previous in-flight request when a newer one is fired
let abortController: AbortController | null = null

const fetchSitters = async (pageNum: number, currentSearch: string, currentStatus: 'All status' | SitterStatus) => {
  if (abortController) abortController.abort()
  abortController = new AbortController()

  isLoading.value = true
  errorMessage.value = ''

  try {
    // "All status" behaves like the example's "Highlight" (no status filter applied)
    const statusParam = currentStatus === 'All status' ? '' : currentStatus

    const response = await axios.get<SitterProfilePageResponse>(`${API_BASE_URL}/sitterprofile`, {
      params: {
        page: pageNum,
        limit,
        keyword: currentSearch.trim(),
        status: statusParam,
      },
      signal: abortController.signal,
    })

    sitters.value = response.data.sitters || []
    totalPages.value = Math.max(1, response.data.totalPages)
  } catch (error) {
    if (axios.isCancel(error)) return

    console.error('Failed to fetch pet sitters:', error)
    errorMessage.value = 'Unable to load pet sitters. Please try again.'
    sitters.value = []
  } finally {
    isLoading.value = false
  }
}

watch(
  [page, debouncedSearch, selectedStatus],
  () => {
    fetchSitters(page.value, debouncedSearch.value, selectedStatus.value)
  },
  { immediate: true },
)

const handlePrevPage = () => {
  if (page.value > 1) page.value--
}

const handleNextPage = () => {
  if (page.value < totalPages.value) page.value++
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (abortController) abortController.abort()
})

const statusColor: Record<SitterStatus, string> = {
  Unverified: 'text-[#9297a9]',
  'Waiting for verify': 'text-[#f783bb]',
  Verified: 'text-[#16a3c7]',
  'Waiting for approve': 'text-[#f783bb]',
  Approved: 'text-[#16c784]',
  Rejected: 'text-[#f04444]',
}

const avatarUrl = (sitter: SitterProfile) => sitter.user.avatarUrl || '/image/dog1.jpg'

// share userId and status of the clicked row with AdminPetSitterView-Profile via the store
const handleSelectSitter = (sitter: SitterProfile) => {
  store.selectSitter(sitter.userId, sitter.approvalStatus, sitter.user.name ?? sitter.displayName)
}
</script>

<template>
  <div class="flex min-h-screen bg-[#f7f8fc]">
    <AdminSidebar />

    <main class="min-w-0 flex-1 px-6 py-6 text-[#242633] sm:px-8 sm:py-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-[17px] font-bold leading-6">Pet Sitter</h1>

        <div class="flex w-full gap-3 sm:w-auto">
          <label class="relative min-w-0 flex-1 sm:w-37.5 sm:flex-none">
            <span class="sr-only">Search pet sitters</span>
            <input v-model="searchQuery" type="search" placeholder="Search..." class="h-8 w-full rounded-md border border-[#e0e3ed] bg-white px-2.5 pr-8 text-[10px] text-[#30343f] outline-none placeholder:text-[#a2a6b5] focus:border-[#afb5ca]" />
            <svg class="pointer-events-none absolute right-2.5 top-2 h-4 w-4 text-[#9aa0b4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" />
            </svg>
          </label>
          <label class="relative w-37.5 shrink-0">
            <span class="sr-only">Filter by status</span>
            <select v-model="selectedStatus" class="h-8 w-full appearance-none rounded-md border border-[#e0e3ed] bg-white px-2.5 pr-7 text-[10px] text-[#9297a9] outline-none focus:border-[#afb5ca]">
              <option value="All status">All status</option>
              <option value="Unverified">Unverified</option>
              <option value="Waiting for verify">Waiting for verify</option>
              <option value="Verified">Verified</option>
              <option value="Waiting for approve">Waiting for approve</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <svg class="pointer-events-none absolute right-2.5 top-3 h-2.5 w-2.5 text-[#8d93a7]" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="m1 1 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </label>
        </div>
      </header>

      <section class="mt-4 overflow-x-auto rounded-xl bg-white shadow-[0_1px_2px_rgba(30,35,55,0.02)]" aria-labelledby="sitters-heading">
        <h2 id="sitters-heading" class="sr-only">Pet sitter list</h2>
        <div class="min-w-[680px]">
          <div class="grid h-7 grid-cols-[1.25fr_1fr_1.6fr_0.75fr] items-center bg-black px-2.5 text-[8px] font-medium text-white">
            <span>Full Name</span>
            <span>Pet Sitter Name</span>
            <span>Email</span>
            <span>Status</span>
          </div>

          <div v-if="isLoading" class="px-2.5 py-8 text-center text-[10px] text-[#9297a9]">Loading pet sitters...</div>
          <div v-else-if="errorMessage" class="px-2.5 py-8 text-center text-[10px] text-[#f04444]">{{ errorMessage }}</div>
          <div v-else-if="sitters.length === 0" class="px-2.5 py-8 text-center text-[10px] text-[#9297a9]">No pet sitters found.</div>
          <RouterLink
            v-for="sitter in sitters"
            :key="sitter.userId"
            :to="{ path: '/admin/petsitters/profile', query: { id: sitter.userId } }"
            class="grid h-[56px] grid-cols-[1.25fr_1fr_1.6fr_0.75fr] items-center border-b border-[#e5e7ef] px-2.5 text-[10px] text-[#242633] last:border-b-0 hover:bg-[#fcfcfe]"
            @click="handleSelectSitter(sitter)"
          >

            <div class="flex items-center gap-2">
              <img :src="avatarUrl(sitter)" :alt="sitter.user.name || 'Pet sitter'" class="h-7 w-7 rounded-full object-cover" />
              <span>{{ sitter.user.name || 'Unnamed user' }}</span>
            </div>
            <span>{{ sitter.displayName }}</span>
            <span>{{ sitter.user.email }}</span>
            <span class="flex items-center gap-1.5" :class="statusColor[sitter.approvalStatus]">
              <span class="h-1 w-1 rounded-full bg-current"></span>
              {{ sitter.approvalStatus }}
            </span>
          </RouterLink>
        </div>
      </section>

      <nav v-if="sitters.length > 0" class="mt-4 flex items-center justify-center gap-3 text-[10px] text-[#aab0c1]" aria-label="Pagination">
        <button type="button" class="p-1.5 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page" :disabled="page === 1" @click="handlePrevPage">
          <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m7.5 2.5-3.5 3.5 3.5 3.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <span class="px-2">Page {{ page }} of {{ totalPages }}</span>
        <button type="button" class="p-1.5 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page" :disabled="page === totalPages" @click="handleNextPage">
          <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m4.5 2.5 3.5 3.5-3.5 3.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </nav>
    </main>
  </div>
</template>
