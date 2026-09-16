<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const isMobileMenuOpen = ref(false)
const isAccountOpen = ref(false)

const ownerLinks = [
  { to: '/owner/profile', label: 'Profile', icon: '/icon/profile.svg' },
  { to: '/owner/pets', label: 'Your Pet', icon: '/icon/paw.svg' },
  { to: '/owner/bookings', label: 'History', icon: '/icon/list.svg' },
  { to: '/owner/password', label: 'Change Password', icon: '/icon/settings.svg' },
]

watch(() => route.fullPath, () => {
  isMobileMenuOpen.value = false
  isAccountOpen.value = false
})

function logout() {
  auth.logout()
  isAccountOpen.value = false
  isMobileMenuOpen.value = false
  void router.push('/')
}
</script>

<template>
  <header class="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/60">
    <nav class="max-w-[1240px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
      <RouterLink to="/" class="inline-flex items-start gap-1 group">
        <img src="/navbar/logo-sitter.svg" alt="Sitter Logo" class="h-7 w-auto transition-transform group-hover:scale-105" />
        <img src="/navbar/logo-star.svg" alt="Star Icon" class="h-3.5 w-3.5 -mt-0.5 animate-pulse" />
      </RouterLink>

      <div class="hidden md:flex items-center gap-8">
        <template v-if="auth.isOwnerLoggedIn">
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2"
              :aria-expanded="isAccountOpen"
              aria-haspopup="menu"
              @click="isAccountOpen = !isAccountOpen"
            >
              <img :src="auth.profile.avatarUrl" alt="" class="size-10 rounded-full object-cover" />
              <img src="/icon/chevron-down.svg" alt="" class="size-4" />
            </button>
            <div
              v-if="isAccountOpen"
              class="absolute right-0 mt-3 w-56 rounded-2xl bg-white p-3 shadow-lg"
              role="menu"
            >
              <RouterLink
                v-for="link in ownerLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-primary-700 no-underline hover:bg-orange-100"
                role="menuitem"
              >
                <img :src="link.icon" alt="" class="size-4" />
                {{ link.label }}
              </RouterLink>
              <button
                type="button"
                class="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-orange-700 hover:bg-orange-100"
                role="menuitem"
                @click="logout"
              >
                <img src="/icon/logout.svg" alt="" class="size-4" />
                Log out
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <RouterLink to="/register" class="text-sm font-medium text-[#292A36] hover:text-[#FF6525] transition-colors">
            Register
          </RouterLink>
          <RouterLink to="/login" class="text-sm font-medium text-[#292A36] hover:text-[#FF6525] transition-colors">
            Login
          </RouterLink>
        </template>

        <RouterLink
          to="/search"
          class="bg-[#FF6525] hover:bg-[#FA5510] text-white text-sm font-bold px-6 py-2.5 rounded-full transition duration-150 shadow-sm hover:shadow active:scale-95"
        >
          Find A Pet Sitter
        </RouterLink>
      </div>

      <button
        type="button"
        class="md:hidden p-2 rounded-lg text-gray-700 hover:text-[#FF6525] hover:bg-gray-100 transition"
        aria-label="Toggle navigation menu"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </nav>

    <div v-if="isMobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3 shadow-lg">
      <template v-if="auth.isOwnerLoggedIn">
        <RouterLink
          v-for="link in ownerLinks"
          :key="link.to"
          :to="link.to"
          class="block py-2 text-base font-medium text-[#292A36] hover:text-[#FF6525]"
        >
          {{ link.label }}
        </RouterLink>
        <button type="button" class="block py-2 text-base font-medium text-orange-700" @click="logout">Log out</button>
      </template>
      <template v-else>
        <RouterLink to="/register" class="block py-2 text-base font-medium text-[#292A36] hover:text-[#FF6525]">
          Register
        </RouterLink>
        <RouterLink to="/login" class="block py-2 text-base font-medium text-[#292A36] hover:text-[#FF6525]">
          Login
        </RouterLink>
      </template>
      <RouterLink
        to="/search"
        class="block w-full bg-[#FF6525] hover:bg-[#FA5510] text-white text-sm font-bold py-3 rounded-full text-center"
      >
        Find A Pet Sitter
      </RouterLink>
    </div>
  </header>
</template>
