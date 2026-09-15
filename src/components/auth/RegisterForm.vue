<script setup lang="ts">
import { ref } from 'vue'

const showPassword = ref(false)
const submitted = ref(false)
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
</script>

<template>
  <form class="register-form" @submit.prevent="submitted = true">
    <h1>Join Us!</h1>
    <p class="subtitle">Find your perfect pet sitter with us</p>
    <div class="role-tabs" aria-label="Account type">
      <span class="owner-tab">Owner</span>
      <span class="sitter-tab" aria-current="page">Sitter</span>
    </div>

    <label for="register-name">Name</label>
    <input id="register-name" v-model.trim="name" type="text" autocomplete="name" placeholder="Your name" required />

    <label for="register-email">Email</label>
    <input id="register-email" v-model.trim="email" type="email" autocomplete="email" placeholder="email@company.com" required />

    <label for="register-phone">Phone</label>
    <input id="register-phone" v-model.trim="phone" type="tel" autocomplete="tel" placeholder="Your phone number" required />

    <label for="register-password">Password</label>
    <div class="password-field">
      <input id="register-password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Create your password" minlength="8" required />
      <button type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button>
    </div>

    <button class="submit-button" type="submit">Register as Sitter</button>
    <p v-if="submitted" class="notice" role="status">ฟอร์มพร้อมแล้ว แต่ยังไม่ได้สร้างบัญชีจริงจนกว่าจะเชื่อม API ของ Spring Boot</p>
    <p class="login-link">Already have an account? <RouterLink to="/login">Login</RouterLink></p>
  </form>
</template>

<style scoped>
.register-form { width: min(100%, 620px); display: flex; flex-direction: column; }
h1 { margin: 0; text-align: center; color: #30343f; font-size: clamp(42px, 5vw, 64px); }
.subtitle { margin: 13px 0 34px; text-align: center; color: #777c8c; font-size: 24px; }
.role-tabs { display: flex; align-self: center; width: min(100%, 440px); margin-bottom: 34px; padding: 5px; border-radius: 50px; background: #f7f7fc; text-align: center; font-size: 22px; font-weight: 700; }
.role-tabs span { width: 50%; padding: 14px 10px; border-radius: 50px; }
.owner-tab { color: #9296a5; }
.sitter-tab { border: 1px solid #ff6b39; color: #ff6b39; background: white; }
label { margin: 21px 0 10px; color: #141414; font-size: 18px; font-weight: 700; }
input { width: 100%; height: 58px; padding: 0 18px; border: 1px solid #d8ddef; border-radius: 10px; color: #20242b; background: white; }
input::placeholder { color: #818697; }
.password-field { position: relative; }
.password-field input { padding-right: 72px; }
.password-field button { position: absolute; right: 9px; top: 9px; height: 40px; border: 0; background: white; color: #777c8c; font-size: 13px; }
.submit-button { min-height: 58px; margin-top: 30px; border: 0; border-radius: 32px; color: white; background: #ff713e; font-size: 21px; font-weight: 700; }
.login-link { margin: 22px 0 0; text-align: center; color: #777c8c; }
.login-link a { font-weight: 700; text-decoration: none; }
.notice { margin: 18px 0 0; color: #5a6172; text-align: center; line-height: 1.5; }
@media (max-width: 600px) {
  .subtitle { font-size: 18px; }
  .role-tabs { font-size: 17px; }
}
</style>
