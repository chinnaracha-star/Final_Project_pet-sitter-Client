<script setup lang="ts">
import { ref } from 'vue'
import SitterSidebar from '../components/sitter/SitterSidebar.vue'
import SitterTopbar from '../components/sitter/SitterTopbar.vue'
import SitterProfileForm from '../components/sitter/SitterProfileForm.vue'

const fullName = ref('')
</script>

<template>
  <div class="profile-shell">
    <SitterSidebar />
    <div class="main-column">
      <SitterTopbar :name="fullName" />
      <SitterProfileForm v-model:full-name="fullName" />
    </div>
  </div>
</template>

<style scoped>
.profile-shell { min-height: 100svh; display: flex; }
.main-column { min-width: 0; flex: 1; }
</style>
