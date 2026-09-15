<script setup lang="ts">
export interface BenefitItem {
  id: string
  image: string
  highlightWord: string
  highlightColor: string
  remainingTitle: string
  line1: string
  line2: string
}

const benefits: BenefitItem[] = [
  {
    id: 'connect',
    image: '/image/content1.png',
    highlightWord: 'Connect',
    highlightColor: 'text-[#1CCD83]', // Green
    remainingTitle: 'With Sitters',
    line1: "Find a verified and reviewed sitter who'll",
    line2: 'keep your pets company and give time.',
  },
  {
    id: 'better',
    image: '/image/content2.png',
    highlightWord: 'Better',
    highlightColor: 'text-[#6ED2FA]', // Sky blue
    remainingTitle: 'For Your Pets',
    line1: 'Pets stay happy at home with a sitter who',
    line2: 'gives them loving care and companionship.',
  },
  {
    id: 'calling',
    image: '/image/content3.png',
    highlightWord: 'Calling',
    highlightColor: 'text-[#FF6525]', // Orange
    remainingTitle: 'All Pets',
    line1: 'Stay for free with adorable animals in unique',
    line2: 'homes around the world.',
  },
]
</script>

<template>
  <section class="w-full pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-24 bg-white">
    <div class="max-w-[1200px] xl:max-w-[1260px] mx-auto px-4 sm:px-6">
      <!-- 3-Column Highlights -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12 xl:gap-16 text-center">
        <div
          v-for="item in benefits"
          :key="item.id"
          class="flex flex-col items-center group"
        >
          <!-- Circular Image Container with Hover Scale -->
          <div class="relative w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 lg:w-56 lg:h-56 mb-5 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-sm">
            <img
              :src="item.image"
              :alt="`${item.highlightWord} ${item.remainingTitle}`"
              class="w-full h-full object-cover select-none"
              loading="lazy"
            />
          </div>

          <!-- Title with Colored Highlight Word -->
          <h3 class="text-base sm:text-lg md:text-xl xl:text-2xl font-bold mb-2">
            <span :class="item.highlightColor">{{ item.highlightWord }}</span>
            <span class="text-[#14151B] ml-1.5">{{ item.remainingTitle }}</span>
          </h3>

          <!-- Description Text: Exactly 2 lines matching Figma -->
          <p class="text-xs sm:text-sm md:text-base text-[#707687] leading-relaxed max-w-[340px] sm:max-w-[380px] md:max-w-[400px] mx-auto">
            <span>{{ item.line1 }}</span>
            <br class="hidden sm:inline" />
            <span class="sm:inline"> {{ item.line2 }}</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
