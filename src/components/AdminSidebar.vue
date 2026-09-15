<script setup lang="ts">
import { computed } from 'vue'

type SidebarItem = {
  label: string
  to: string
  icon: 'owner' | 'sitter' | 'report'
}

const props = withDefaults(defineProps<{
  activePath?: string
}>(), {
  activePath: '/admin/owners',
})

const items: SidebarItem[] = [
  { label: 'Pet Owner', to: '/admin/owners', icon: 'owner' },
  { label: 'Pet Sitter', to: '/admin/sitters', icon: 'sitter' },
  { label: 'Report', to: '/admin/reports', icon: 'report' },
]

const isActive = (item: SidebarItem) => computed(() => props.activePath === item.to)
</script>

<template>
  <aside class="flex min-h-screen w-38.75 shrink-0 flex-col bg-[#050505] text-white" aria-label="Admin navigation">
    <div class="px-3.75 pb-6 pt-8.75">
      <div class="text-[26px] font-extrabold leading-none tracking-[-1.5px]">
        <span class="italic text-[#ff6b39]">S</span><span class="text-white">itter</span><span class="ml-0.5 align-top text-[15px] text-[#19bb80]">✦</span>
      </div>
      <p class="mt-1 text-[10px] italic leading-none text-[#8b8c98]">Admin Panel</p>
    </div>

    <nav class="flex flex-col gap-1" aria-label="Admin menu">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex min-h-10 items-center gap-2.75 px-3.75 text-[11px] text-[#c8c8d0] transition-colors hover:bg-[#292932] hover:text-white"
        :class="isActive(item).value ? 'bg-[#3c3c47] text-white' : ''"
        :aria-current="isActive(item).value ? 'page' : undefined"
      >
        <svg v-if="item.icon === 'owner'" class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 20c.6-3.7 2.8-5.5 6.5-5.5s5.9 1.8 6.5 5.5" />
        </svg>
        <svg v-else-if="item.icon === 'sitter'" class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" aria-hidden="true">
          <path d="M7.4 10.4c-1.7-2.4-.2-4.8 1.7-3.8L12 8.4l2.9-1.8c1.9-1 3.4 1.4 1.7 3.8 1.9-.2 3.1 1.1 2.6 2.8-.4 1.4-1.7 2.1-3.4 1.8 1.2 1.5.5 3.5-1.3 3.5-1.3 0-2.1-.8-2.5-1.6-.4.8-1.2 1.6-2.5 1.6-1.8 0-2.5-2-1.3-3.5-1.7.3-3-.4-3.4-1.8-.5-1.7.7-3 2.6-2.8Z" />
          <circle cx="9" cy="11" r=".5" fill="currentColor" /><circle cx="15" cy="11" r=".5" fill="currentColor" />
        </svg>
        <svg v-else class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" aria-hidden="true">
          <path d="M6 3.8h8.5L18 7.3v12.9H6z" /><path d="M14 3.8v3.5h4" /><path d="M9 14h6M9 10.5h2" />
        </svg>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <RouterLink
      to="/login"
      class="mt-auto flex min-h-14.75 items-center gap-2.75 border-t border-[#363640] px-3.75 text-[11px] text-[#c8c8d0] transition-colors hover:bg-[#292932] hover:text-white"
    >
      <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true">
        <path d="M13 5H6.5v14H13M11 12h9M17 8l3.5 4-3.5 4" />
      </svg>
      <span>Log Out</span>
    </RouterLink>
  </aside>
</template>