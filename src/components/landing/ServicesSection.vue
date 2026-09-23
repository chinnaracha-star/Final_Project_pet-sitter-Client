<script setup lang="ts">
import type { ServiceItem } from '../../types/landing'
export type { ServiceItem }

const services: ServiceItem[] = [
  {
    id: 'boarding',
    title: 'Boarding',
    description: "Your pets stay overnight in your sitter's home. They'll be treated like part of the family in a comfortable environment.",
    starColor: '#6ED2FA', // Sky blue
  },
  {
    id: 'house-sitting',
    title: 'House Sitting',
    description: "Your sitter takes care of your pets and your home. Your pets will get all the attention they need without leaving home.",
    starColor: '#FA8EC3', // Soft pink
  },
  {
    id: 'dog-walking',
    title: 'Dog Walking',
    description: "Your dog gets a walk around your neighborhood. Perfect for busy days and dogs with extra energy to burn.",
    starColor: '#1CCD83', // Bright emerald green
  },
  {
    id: 'drop-in',
    title: 'Drop-In Visits',
    description: "Your sitter drops by your home to play with your pets, offer food, and give potty breaks or clean the litter box.",
    starColor: '#FFA726', // Warm yellow/orange
  },
]
</script>

<template>
  <section class="w-full pt-16 sm:pt-24 md:pt-28 pb-16 sm:pb-24 md:pb-28 bg-white">
    <div class="max-w-[880px] lg:max-w-[920px] xl:max-w-[960px] mx-auto px-4 sm:px-6">
      <!-- Section Title: Headline aligned with Boarding text per Figma -->
      <div class="mb-10 sm:mb-14 lg:mb-16">
        <h2
          class="text-xl sm:text-2xl md:text-[26px] lg:text-[28px] font-bold text-[#111319] text-center lg:text-left tracking-[0.01em] leading-snug pl-0 lg:pl-[38px] whitespace-normal"
        >
          "Your Pets, Our Priority: Perfect Care, Anytime, Anywhere."
        </h2>
      </div>

      <!-- Content: Services List & Cat Arch Image precisely matched to Figma bounds -->
      <div class="flex flex-col lg:flex-row items-center lg:items-stretch justify-center lg:justify-between gap-8 sm:gap-10 lg:gap-10 xl:gap-12">
        <!-- Left: 4 Service Features (Evenly distributed to match the exact height of the cat image) -->
        <div class="w-full lg:w-[390px] xl:w-[410px] shrink-0 flex flex-col justify-between py-0.5 space-y-6 lg:space-y-0">
          <div
            v-for="service in services"
            :key="service.id"
            class="flex items-start gap-3.5 sm:gap-4 group"
          >
            <!-- Star Burst Icon -->
            <div class="shrink-0 mt-0.5">
              <svg
                class="w-5 h-5 sm:w-[22px] sm:h-[22px] transition-transform duration-200 group-hover:scale-125"
                viewBox="0 0 16.7742 16.7742"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.3871 0L10.6267 4.05392L15.113 3.32233L13.4194 7.6459L16.7742 10.7876L12.4227 12.125L12.1197 16.7742L8.3871 14.1184L4.65449 16.7742L4.35154 12.125L0 10.7876L3.35484 7.6459L1.66117 3.32233L6.14753 4.05392L8.3871 0Z"
                  :fill="service.starColor"
                />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1">
              <h3 class="text-base sm:text-lg md:text-[19px] font-bold text-[#14151B] tracking-tight mb-1">
                {{ service.title }}
              </h3>
              <p class="text-xs sm:text-[13.5px] text-[#707687] leading-relaxed max-w-[340px] sm:max-w-[360px]">
                {{ service.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Arch Illustration with Cat (Exact Figma arch corners & ultra-sharp resolution) -->
        <div class="w-full lg:w-auto shrink-0 flex justify-center items-center">
          <div class="relative w-[280px] sm:w-[320px] md:w-[350px] lg:w-[360px] xl:w-[375px] transition-transform duration-300 hover:scale-[1.02]">
            <img
              src="/image/blackcat-figma.png"
              alt="Cat being gently petted in arch illustration"
              class="w-full h-auto object-contain select-none pointer-events-none drop-shadow-sm"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
