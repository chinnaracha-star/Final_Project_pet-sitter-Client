<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <header class="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/60">
    <nav class="max-w-[1240px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
      <!-- Brand Logo -->
      <RouterLink to="/" class="inline-flex items-start gap-1 group">
        <img
          src="/navbar/logo-sitter.svg"
          alt="Sitter Logo"
          class="h-7 w-auto transition-transform group-hover:scale-105"
        />
        <img
          src="/navbar/logo-star.svg"
          alt="Star Icon"
          class="h-3.5 w-3.5 -mt-0.5 animate-pulse"
        />
      </RouterLink>

      <!-- Desktop Navigation Links -->
      <div class="hidden md:flex items-center gap-8">
        <RouterLink
          to="/register"
          class="text-sm font-medium text-[#292A36] hover:text-[#FF6525] transition-colors"
        >
          Register
        </RouterLink>

        <RouterLink
          to="/login"
          class="text-sm font-medium text-[#292A36] hover:text-[#FF6525] transition-colors"
        >
          Login
        </RouterLink>

        <RouterLink
          to="/search"
          class="bg-[#FF6525] hover:bg-[#FA5510] text-white text-sm font-bold px-6 py-2.5 rounded-full transition duration-150 shadow-sm hover:shadow active:scale-95"
        >
          Find A Pet Sitter
        </RouterLink>
      </div>

      <!-- Mobile Hamburger Button -->
      <button
        type="button"
        class="md:hidden p-2 rounded-lg text-gray-700 hover:text-[#FF6525] hover:bg-gray-100 transition"
        aria-label="Toggle navigation menu"
        @click="toggleMobileMenu"
      >
        <svg
          v-if="!isMobileMenuOpen"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </nav>

    <!-- Mobile Dropdown Menu -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3 shadow-lg"
    >
      <RouterLink
        to="/register"
        class="block py-2 text-base font-medium text-[#292A36] hover:text-[#FF6525]"
        @click="isMobileMenuOpen = false"
      >
        Register
      </RouterLink>
      <RouterLink
        to="/login"
        class="block py-2 text-base font-medium text-[#292A36] hover:text-[#FF6525]"
        @click="isMobileMenuOpen = false"
      >
        Login
      </RouterLink>
      <RouterLink
        to="/search"
        class="w-full bg-[#FF6525] hover:bg-[#FA5510] text-white text-sm font-bold py-3 rounded-full transition shadow active:scale-95"
        @click="isMobileMenuOpen = false"
      >
        Find A Pet Sitter
      </RouterLink>
    </div>
  </header>
</template>
