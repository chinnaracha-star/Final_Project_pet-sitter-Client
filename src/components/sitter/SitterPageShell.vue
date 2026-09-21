<script setup lang="ts">
import SitterSidebar from './SitterSidebar.vue'
import SitterTopbar from './SitterTopbar.vue'

defineProps<{ name?: string }>()
</script>

<template>
  <div class="shell">
    <SitterSidebar />
    <div class="main"><SitterTopbar :name="name || ''" /><slot /></div>
  </div>
</template>

<style scoped>
.shell { min-height: 100svh; display: flex; }
.main { min-width: 0; flex: 1; }
</style>
