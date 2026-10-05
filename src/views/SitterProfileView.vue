<script setup lang="ts">
import { ref } from 'vue'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
import SitterProfileForm from '../components/sitter/SitterProfileForm.vue'

const fullName = ref('')
const avatarUrl = ref('')
</script>

<template>
  <SitterPageShell :name="fullName" :avatar-url="avatarUrl">
    <SitterProfileForm v-model:full-name="fullName" v-model:avatar-url="avatarUrl" />
  </SitterPageShell>
</template>
