<script setup lang="ts">
defineProps<{
  count: number
  showNumber?: boolean
}>()
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <span v-if="showNumber" class="text-sm font-semibold text-gray-700 mr-0.5">
      {{ count }}
    </span>
    <div class="inline-flex items-center gap-0.5">
      <svg
        v-for="i in count"
        :key="i"
        class="w-3.5 h-3.5 text-[#1CCD83] fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
        />
      </svg>
    </div>
  </div>
</template>
