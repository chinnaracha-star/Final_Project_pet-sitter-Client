<script setup lang="ts">
import { ref } from 'vue'

const fullName = ref('')
const email = ref('')
const phone = ref('')
const notice = ref('')

function saveProfile() {
  notice.value = 'Owner profile fields match the User entity. Saving will wait until the Spring Boot API is connected.'
}
</script>

<template>
  <main class="auth-page">
    <form class="auth-form" @submit.prevent="saveProfile">
      <div class="mb-7 flex items-baseline justify-between gap-4">
        <h1 class="text-[28px] font-extrabold text-neutral-900">Pet Owner Profile</h1>
        <RouterLink class="text-sm font-bold no-underline" to="/login">Back to Login</RouterLink>
      </div>

      <label class="auth-label" for="owner-name">Name</label>
      <input id="owner-name" v-model.trim="fullName" class="auth-input" autocomplete="name" placeholder="Your name" required />

      <label class="auth-label" for="owner-email">Email</label>
      <input id="owner-email" v-model.trim="email" class="auth-input" type="email" autocomplete="email" placeholder="email@company.com" required />

      <label class="auth-label" for="owner-phone">Phone</label>
      <input id="owner-phone" v-model.trim="phone" class="auth-input" type="tel" autocomplete="tel" placeholder="Your phone number" required />

      <button class="auth-submit mt-6" type="submit">Save profile</button>
      <p v-if="notice" class="auth-notice" role="status">{{ notice }}</p>
    </form>
  </main>
</template>
