<script setup lang="ts">
import { ref } from 'vue'
import SitterBrand from '../SitterBrand.vue'

const email = ref('')
const password = ref('')
const submitted = ref(false)
</script>

<template>
  <div class="login-card">
    <div class="login-brand">
      <SitterBrand />
    </div>
    <form class="login-form" @submit.prevent="submitted = true">
      <h1>Welcome Back!</h1>
      <p>Become the best Pet Sitter with us</p>

      <label for="login-email">Email</label>
      <input id="login-email" v-model.trim="email" type="email" autocomplete="email" placeholder="email@company.com" required />

      <label for="login-password">Password</label>
      <input id="login-password" v-model="password" type="password" autocomplete="current-password" required />

      <span class="forgot-password">Forgot Password?</span>
      <button type="submit">Login</button>
      <p v-if="submitted" class="login-notice" role="status">
        หน้า Login พร้อมแล้ว แต่ยังไม่ได้เชื่อม API ของ Spring Boot
        <RouterLink to="/sitter/profile">ดูหน้า Sitter Profile ตัวอย่าง</RouterLink>
      </p>
      <p class="register-link">Don't have a Pet Sitter account? <RouterLink to="/register">Register</RouterLink></p>
    </form>
  </div>
</template>

<style scoped>
.login-card { width: min(100%, 920px); min-height: 640px; position: relative; display: grid; place-items: center; background: white; }
.login-brand { position: absolute; top: 28px; left: 32px; font-size: 26px; }
.login-form { width: min(100% - 48px, 380px); display: flex; flex-direction: column; }
h1 { margin: 0; color: #141414; text-align: center; font-size: clamp(30px, 4vw, 38px); }
p { margin: 6px 0 30px; color: #707687; text-align: center; font-size: 14px; }
label { margin: 13px 0 7px; color: #151515; font-size: 13px; font-weight: 700; }
input { width: 100%; height: 44px; padding: 0 14px; border: 1px solid #dce0f2; border-radius: 7px; color: #222; background: white; }
.forgot-password { align-self: flex-end; margin: 12px 0 18px; color: #ff713e; font-size: 12px; }
button { min-height: 45px; border: 0; border-radius: 24px; background: #ff713e; color: white; font-weight: 700; }
.register-link { margin: 17px 0 0; color: #292929; font-size: 13px; }
.register-link a { margin-left: 3px; font-weight: 700; text-decoration: none; }
.login-notice { margin: 18px 0 0; line-height: 1.5; }
.login-notice a { display: block; }
@media (max-width: 600px) {
  .login-card { min-height: 100svh; }
  .login-brand { top: 20px; left: 24px; }
}
</style>
