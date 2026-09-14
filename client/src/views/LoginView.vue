<script setup lang="ts">
import LoginForm from '../components/auth/LoginForm.vue'
</script>

<template>
  <main class="login-page">
    <LoginForm />
  </main>
</template>

<style scoped>
.login-page { min-height: 100svh; display: grid; place-items: center; padding: 24px; background: #eeeeef; }
@media (max-width: 600px) {
  .login-page { padding: 0; background: white; }
}
</style>
