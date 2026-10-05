<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

type SidebarItem = {
  label: string
  to: string
  icon: 'owner' | 'sitter' | 'report'
}

const props = withDefaults(defineProps<{
  activePath?: string
}>(), {
  activePath: '',
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

async function logout() {
  await auth.logout()
  await router.push('/login')
}

const items: SidebarItem[] = [
  { label: 'Pet Owner', to: '/admin/owners', icon: 'owner' },
  { label: 'Pet Sitter', to: '/admin/petsitters', icon: 'sitter' },
  { label: 'Report', to: '/admin/reports', icon: 'report' },
]

// falls back to the current route so the highlight follows navigation automatically
const currentPath = computed(() => props.activePath || route.path)
const isActive = (item: SidebarItem) => computed(() => currentPath.value.startsWith(item.to))
</script>

<template>
  <aside class="flex min-h-screen w-[188px] shrink-0 flex-col bg-[#050505] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]" aria-label="Admin navigation">
    <div class="px-4 pb-6 pt-8">
      <div class="text-[28px] font-black leading-none tracking-[-1.5px]">
        <span class="italic text-[#ff6b39]">S</span><span class="text-white">itter</span><span class="ml-1 align-top text-[11px] text-[#4bd58f]">✦</span>
      </div>
      <p class="mt-2 text-[10px] italic leading-none text-[#8d8f9d]">Admin Panel</p>
    </div>

    <nav class="mt-3 flex flex-col gap-1 px-2" aria-label="Admin menu">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex min-h-[36px] w-full items-center gap-3 rounded-md px-3 text-[12px] font-medium text-[#f3f5fa] transition-all duration-150 hover:bg-[#171a1f]"
        :class="isActive(item).value ? 'border border-[#32363d] bg-[#2d3037] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]' : 'text-[#eef1f7]'"
        :aria-current="isActive(item).value ? 'page' : undefined"
      >
        <img
          :src="`/icon/${item.icon === 'owner' ? 'profile' : item.icon === 'sitter' ? 'paw' : 'copy'}.svg`"
          alt=""
          class="h-[15px] w-[15px] shrink-0"
          :class="{ 'brightness-0 invert-[0.69]': item.icon === 'owner' }"
          aria-hidden="true"
        />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <RouterLink
      to="/admin/login"
      class="mt-auto flex h-[54px] items-center gap-3 border-t border-[#1d1f24] px-4 text-[12px] font-medium text-[#f3f5fa] transition-colors hover:bg-[#171a1f]"
      @click="logout"
    >
      <img src="/icon/logout.svg" alt="" class="h-[15px] w-[15px] shrink-0" aria-hidden="true" />
      <span>Log Out</span>
    </RouterLink>
  </aside>
</template>
