<script setup lang="ts">
import { ref } from 'vue'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
import SitterProfileForm from '../components/sitter/SitterProfileForm.vue'

const fullName = ref('')
</script>

<template>
  <SitterPageShell :name="fullName"><SitterProfileForm v-model:full-name="fullName" /></SitterPageShell>
</template>
