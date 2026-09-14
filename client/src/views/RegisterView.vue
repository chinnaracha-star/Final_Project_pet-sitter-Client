<script setup lang="ts">
import RegisterForm from '../components/auth/RegisterForm.vue'
</script>

<template>
  <main class="register-page">
    <RegisterForm />
  </main>
</template>

<style scoped>
.register-page { min-height: 100svh; display: grid; place-items: center; padding: 45px 20px; background: white; }
@media (max-width: 600px) {
  .register-page { padding: 32px 20px; }
}
</style>
