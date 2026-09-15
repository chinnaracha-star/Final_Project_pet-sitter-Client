<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="w-full pt-4 sm:pt-8 pb-8 sm:pb-10 md:pb-12 lg:pb-14 bg-white">
    <div class="max-w-[1240px] xl:max-w-[1290px] mx-auto px-4 sm:px-6">
      <!-- Banner Container (Slightly bigger & closer to footer per user request) -->
      <div
        class="relative w-full rounded-2xl md:rounded-[32px] bg-[#FFF5EC] overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28 xl:py-30 px-6 sm:px-12 flex flex-col items-center justify-center text-center shadow-xs"
      >
        <!-- Bottom-Left Blue Arc Shape -->
        <div class="absolute -bottom-4 -left-4 sm:bottom-0 sm:left-0 pointer-events-none select-none opacity-90 sm:opacity-100">
          <img
            src="/image/arc-blue.svg"
            alt="Blue arc decoration"
            class="w-32 sm:w-48 md:w-64 lg:w-72 xl:w-80 h-auto object-contain"
          />
        </div>

        <!-- Top-Right Yellow Circle and Green Star Shapes -->
        <div class="absolute top-0 right-0 pointer-events-none select-none opacity-90 sm:opacity-100">
          <!-- Yellow Circle -->
          <div
            class="absolute -top-12 -right-12 sm:-top-16 sm:-right-16 md:-top-24 md:-right-24 lg:-top-28 lg:-right-28 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-88 lg:h-88 xl:w-96 xl:h-96 rounded-full bg-[#FFCA62]"
          ></div>

          <!-- Green Star Burst -->
          <div class="relative top-6 right-6 sm:top-14 sm:right-16 md:top-20 md:right-24 lg:top-28 lg:right-32 xl:top-32 xl:right-36">
            <svg
              class="w-14 h-14 sm:w-22 sm:h-22 md:w-30 md:h-30 lg:w-36 lg:h-36 drop-shadow-xs"
              viewBox="0 0 188 191"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M123.205 -6.6489e-05L136.203 50.0201L187.646 55.4059L156.61 96.7227L184.492 140.259L132.793 141.76L116.118 190.662L82.6866 151.217L34.0115 168.662L44.0222 117.974L-2.29721e-05 90.8242L45.9146 67.0621L39.6949 15.7626L86.9388 36.8199L123.205 -6.6489e-05Z"
                fill="#1CCD83"
              />
            </svg>
          </div>
        </div>

        <!-- Banner Content (Prominent Headline & Large CTA Buttons) -->
        <div class="relative z-10 max-w-4xl mx-auto px-2">
          <h2
            class="text-3xl sm:text-5xl md:text-6xl lg:text-[56px] xl:text-[60px] font-black text-[#14151B] tracking-tight leading-[1.15] sm:leading-[1.15]"
          >
            Perfect Pet Sitter<br />
            For Your Pet
          </h2>

          <div class="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5">
            <RouterLink
              to="/register"
              class="w-full sm:w-auto inline-flex items-center justify-center bg-[#FFEAE3] hover:bg-[#ffd9cf] text-[#FF6525] font-bold text-xs sm:text-sm md:text-base lg:text-lg px-7 sm:px-9 py-3.5 sm:py-4 rounded-full transition active:scale-95"
            >
              Register
            </RouterLink>

            <button
              type="button"
              class="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF6525] hover:bg-[#FA5510] text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg px-8 sm:px-10 py-3.5 sm:py-4 rounded-full transition shadow-md hover:shadow-lg active:scale-95"
            >
              Find A Pet Sitter
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
