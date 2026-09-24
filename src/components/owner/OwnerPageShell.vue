<script setup lang="ts">
import OwnerSidebar from './OwnerSidebar.vue'

defineProps<{
  title: string
}>()
</script>

<template>
  <div class="min-h-svh bg-[#f6f7fb]">
    <slot name="nav" />
    <div class="mx-auto flex w-full max-w-[1180px] items-start gap-6 px-5 py-8 max-[760px]:gap-3 max-[760px]:px-3">
      <OwnerSidebar />
      <main class="min-w-0 flex-1 rounded-2xl bg-white px-8 py-8 shadow-sm max-[760px]:px-5">
        <div class="mb-8 flex items-center justify-between gap-4">
          <h1 class="text-[28px] font-bold text-primary-900">{{ title }}</h1>
          <slot name="actions" />
        </div>
        <slot />
      </main>
    </div>
  </div>
</template>
