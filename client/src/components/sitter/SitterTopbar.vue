<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <header class="topbar">
    <span class="small-avatar">♙</span>
    <span>{{ name || 'Pet Sitter' }}</span>
  </header>
</template>

<style scoped>
.topbar { height: 78px; display: flex; gap: 14px; align-items: center; padding: 0 36px; background: white; border-bottom: 1px solid #e0e4f2; }
.small-avatar { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: #e7e9f6; color: white; font-size: 24px; }
@media (max-width: 760px) {
  .topbar { padding: 0 20px; }
}
</style>
