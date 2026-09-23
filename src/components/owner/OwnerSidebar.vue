<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const links = [
  { to: '/owner/profile', label: 'Profile', icon: '/icon/profile.svg', match: 'exact' as const },
  { to: '/owner/pets', label: 'Your Pet', icon: '/icon/paw.svg', match: 'prefix' as const },
  { to: '/owner/bookings', label: 'Booking History', icon: '/icon/list.svg', match: 'exact' as const },
  { to: '/owner/password', label: 'Change Password', icon: '/icon/settings.svg', match: 'exact' as const },
]

function active(link: (typeof links)[number]) {
  return link.match === 'prefix' ? route.path.startsWith(link.to) : route.path === link.to
}

function logout() {
  void auth.logout().then(() => router.push('/'))
}
</script>

<template>
  <aside class="flex w-[240px] shrink-0 flex-col rounded-2xl bg-white p-4 shadow-sm max-[760px]:w-[72px] max-[760px]:px-2">
    <p class="px-3 pb-3 text-sm font-bold text-primary-900 max-[760px]:sr-only">Account</p>
    <nav class="flex flex-col gap-1" aria-label="Owner account">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium no-underline max-[760px]:justify-center max-[760px]:px-0"
        :class="active(link) ? 'bg-orange-100 text-orange-700' : 'text-primary-500 hover:bg-orange-100/60'"
        :aria-current="active(link) ? 'page' : undefined"
      >
        <span
          class="size-5 shrink-0 bg-current"
          :style="{
            WebkitMask: `url(${link.icon}) center / contain no-repeat`,
            mask: `url(${link.icon}) center / contain no-repeat`,
          }"
        />
        <span class="max-[760px]:sr-only">{{ link.label }}</span>
      </RouterLink>
    </nav>
    <button
      type="button"
      class="mt-4 flex items-center gap-3 border-t border-primary-100 px-3 pt-4 text-left text-sm font-medium text-orange-700 max-[760px]:justify-center max-[760px]:px-0"
      @click="logout"
    >
      <img src="/icon/logout.svg" alt="" class="size-5" />
      <span class="max-[760px]:sr-only">Log Out</span>
    </button>
  </aside>
</template>
