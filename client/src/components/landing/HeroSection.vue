<script setup lang="ts">
import HeroGraphicLeft from './HeroGraphicLeft.vue'
import HeroTitle from './HeroTitle.vue'
import HeroGraphicRight from './HeroGraphicRight.vue'
import SearchFilterCard, { type SearchFilterState } from './SearchFilterCard.vue'

const emit = defineEmits<{
  (e: 'search', filters: SearchFilterState): void
}>()

function onSearch(filters: SearchFilterState) {
  emit('search', filters)
}
</script>

<template>
  <section class="relative w-full overflow-hidden pt-6 sm:pt-10 pb-6 sm:pb-8">
    <!-- Hero Main Stage Container (Enlarged and wider than search card per Figma) -->
    <div class="max-w-[1280px] xl:max-w-[1360px] 2xl:max-w-[1420px] mx-auto px-4 sm:px-6">
      <!-- Desktop (lg+): 3-Column Composition [Cats - Headline - Dog] -->
      <div class="hidden lg:flex items-center justify-between gap-4 xl:gap-8">
        <!-- Left Illustration: Cats & Shapes -->
        <div class="shrink-0 w-full max-w-[360px] xl:max-w-[420px] 2xl:max-w-[440px] flex justify-start">
          <HeroGraphicLeft />
        </div>

        <!-- Center Text: Headline & Subtitle -->
        <div class="flex-1 max-w-[520px] xl:max-w-[580px] flex flex-col items-center justify-center py-2">
          <HeroTitle />
        </div>

        <!-- Right Illustration: Bulldog & Shapes -->
        <div class="shrink-0 w-full max-w-[360px] xl:max-w-[420px] 2xl:max-w-[440px] flex justify-end">
          <HeroGraphicRight />
        </div>
      </div>

      <!-- Mobile & Tablet (< lg): Centered Headline + Compact Side-by-Side Pet Graphics -->
      <div class="flex lg:hidden flex-col items-center text-center">
        <HeroTitle />

        <!-- Side-by-Side Cute Pets Preview on Mobile / Tablet -->
        <div class="flex items-center justify-center gap-3 sm:gap-6 my-6 max-w-lg mx-auto">
          <div class="w-40 sm:w-48 shrink-0">
            <HeroGraphicLeft />
          </div>
          <div class="w-40 sm:w-48 shrink-0">
            <HeroGraphicRight />
          </div>
        </div>
      </div>

      <!-- Floating Search & Filter Card (Moderately adjusted position & widened) -->
      <div class="mt-10 sm:mt-14 lg:mt-16 relative z-20 w-full max-w-[880px] xl:max-w-[940px] mx-auto">
        <SearchFilterCard @search="onSearch" />
      </div>
    </div>
  </section>
</template>
