<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="w-full bg-black text-white py-14 sm:py-20">
    <div class="max-w-[1240px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center">
      <!-- White Sitter Brand Logo -->
      <RouterLink to="/" class="inline-block transition-transform hover:scale-105">
        <img
          src="/image/Sitter-logo-white.svg"
          alt="Sitter White Logo"
          class="h-9 sm:h-10 md:h-11 w-auto"
        />
      </RouterLink>

      <!-- Tagline: Spacing and tracking precisely matched to Figma -->
      <p
        class="mt-6 sm:mt-7 md:mt-8 text-sm sm:text-base md:text-[17px] font-normal text-white leading-normal"
        style="letter-spacing: 0.08em; word-spacing: 0.18em;"
      >
        Find your perfect pet sitter with us.
      </p>
    </div>
  </footer>
</template>
