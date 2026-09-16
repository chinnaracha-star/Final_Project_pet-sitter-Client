<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="min-h-svh bg-white">
    <slot name="nav" />
    <main class="mx-auto w-full max-w-[960px] px-5 py-10 sm:px-8">
      <h1 class="mb-8 text-[28px] font-bold text-primary-900">{{ title }}</h1>
      <slot />
    </main>
  </div>
</template>
