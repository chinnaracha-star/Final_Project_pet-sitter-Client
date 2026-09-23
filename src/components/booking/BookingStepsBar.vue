<script setup lang="ts">
defineProps<{
  currentStep?: 1 | 2 | 3
}>()

const steps = [
  { step: 1, label: 'Your Pet' },
  { step: 2, label: 'Information' },
  { step: 3, label: 'Payment' },
]
</script>

<template>
  <div class="w-full rounded-2xl bg-white px-6 py-4 shadow-sm border border-gray-100 flex items-center justify-around sm:justify-start sm:gap-12 md:gap-16">
    <div
      v-for="item in steps"
      :key="item.step"
      class="flex items-center gap-3"
    >
      <!-- Step Badge -->
      <div
        class="size-8 sm:size-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
        :class="[
          (currentStep ?? 1) > item.step
            ? 'bg-[#181A20] text-white shadow-sm'
            : (currentStep ?? 1) === item.step
              ? 'bg-[#FF6433] text-white shadow-sm'
              : 'bg-gray-100 text-[#82869B]',
        ]"
      >
        {{ item.step }}
      </div>

      <!-- Step Label -->
      <span
        class="text-[14px] sm:text-[15px] font-semibold transition-colors"
        :class="[
          (currentStep ?? 1) > item.step
            ? 'text-[#181A20]'
            : (currentStep ?? 1) === item.step
              ? 'text-[#FF6433]'
              : 'text-[#82869B]',
        ]"
      >
        {{ item.label }}
      </span>
    </div>
  </div>
</template>
