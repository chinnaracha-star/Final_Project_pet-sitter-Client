<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { useAdminPetSitterStore, type SitterStatus } from '../../stores/adminPetSitter'

const store = useAdminPetSitterStore()

const statusColor: Record<SitterStatus, string> = {
  'Waiting for approve': 'text-[#f783bb]',
  Approved: 'text-[#16c784]',
  Rejected: 'text-[#f04444]',
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
            <input type="search" placeholder="Search..." class="h-8 w-full rounded-md border border-[#e0e3ed] bg-white px-2.5 pr-8 text-[10px] text-[#30343f] outline-none placeholder:text-[#a2a6b5] focus:border-[#afb5ca]" />
            <svg class="pointer-events-none absolute right-2.5 top-2 h-4 w-4 text-[#9aa0b4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" />
            </svg>
          </label>
          <label class="relative w-37.5 shrink-0">
            <span class="sr-only">Filter by status</span>
            <select class="h-8 w-full appearance-none rounded-md border border-[#e0e3ed] bg-white px-2.5 pr-7 text-[10px] text-[#9297a9] outline-none focus:border-[#afb5ca]">
              <option>All status</option>
              <option>Unverified</option>
              <option>Waiting for verify</option>
              <option>Verified</option>
              <option>Waiting for approve</option>
              <option>Approved</option>
              <option>Rejected</option>
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

          <RouterLink
            v-for="sitter in store.sitters"
            :key="sitter.id"
            to="/admin/petsitters/profile"
            class="grid h-[56px] grid-cols-[1.25fr_1fr_1.6fr_0.75fr] items-center border-b border-[#e5e7ef] px-2.5 text-[10px] text-[#242633] last:border-b-0 hover:bg-[#fcfcfe]"
            @click="store.selectSitter(sitter.id)"
          >

            <div class="flex items-center gap-2">
              <img src="/image/dog1.jpg" alt="" class="h-7 w-7 rounded-full object-cover" />
              <span>{{ sitter.name }}</span>
            </div>
            <span>{{ sitter.sitterName }}</span>
            <span>{{ sitter.email }}</span>
            <span class="flex items-center gap-1.5" :class="statusColor[sitter.status]">
              <span class="h-1 w-1 rounded-full bg-current"></span>
              {{ sitter.status }}
            </span>
          </RouterLink>
        </div>
      </section>

      <nav class="mt-4 flex items-center justify-center gap-3 text-[10px] text-[#aab0c1]" aria-label="Pagination">
        <button type="button" class="p-1.5" aria-label="Previous page"><svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m7.5 2.5-3.5 3.5 3.5 3.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
        <button type="button" class="h-6 w-6 rounded-full bg-[#fff0eb] text-[#ff7955]" aria-current="page">1</button>
        <button type="button" class="h-6 w-6 rounded-full bg-white text-[#aab0c1]">2</button>
        <span>...</span>
        <button type="button" class="h-6 w-6 rounded-full bg-white text-[#aab0c1]">44</button>
        <button type="button" class="h-6 w-6 rounded-full bg-white text-[#aab0c1]">45</button>
        <button type="button" class="p-1.5" aria-label="Next page"><svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m4.5 2.5 3.5 3.5-3.5 3.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
      </nav>
    </main>
  </div>
</template>