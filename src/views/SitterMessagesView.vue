<script setup lang="ts">
import SitterSidebar from '../components/sitter/SitterSidebar.vue'
import SitterTopbar from '../components/sitter/SitterTopbar.vue'
</script>

<template>
  <div class="profile-shell">
    <SitterSidebar />
    <div class="main-column">
      <SitterTopbar name="" />
      <section class="placeholder" aria-label="Messages">
        <h1>Messages</h1>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-shell { min-height: 100svh; display: flex; }
.main-column { min-width: 0; flex: 1; }
.placeholder { padding: 36px; }
.placeholder h1 { margin: 0; font-size: 24px; font-weight: 700; color: #3a3b46; }
</style>
