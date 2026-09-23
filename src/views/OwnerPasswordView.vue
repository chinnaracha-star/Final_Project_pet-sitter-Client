<script setup lang="ts">
import { ref } from 'vue'
import { Navbar } from '../components'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const notice = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  notice.value = ''
  if (newPassword.value.length < 8) {
    error.value = 'New password must be at least 8 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'New password and confirm password must match.'
    return
  }
  try {
    await auth.changePassword(currentPassword.value, newPassword.value)
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    notice.value = 'Password updated.'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not update password'
  }
}
</script>

<template>
  <OwnerPageShell title="Change Password">
    <template #nav>
      <Navbar />
    </template>

    <form class="max-w-[520px]" @submit.prevent="submit">
      <label class="auth-label" for="current-password">Current Password</label>
      <input
        id="current-password"
        v-model="currentPassword"
        class="auth-input rounded-lg!"
        type="password"
        autocomplete="current-password"
        minlength="8"
        required
      />

      <label class="auth-label" for="new-password">New Password</label>
      <input
        id="new-password"
        v-model="newPassword"
        class="auth-input rounded-lg!"
        type="password"
        autocomplete="new-password"
        minlength="8"
        required
      />

      <label class="auth-label" for="confirm-password">Confirm Password</label>
      <input
        id="confirm-password"
        v-model="confirmPassword"
        class="auth-input rounded-lg!"
        type="password"
        autocomplete="new-password"
        minlength="8"
        required
      />

      <div class="mt-8 flex justify-end">
        <button class="auth-submit w-auto px-8 whitespace-nowrap" type="submit">Change Password</button>
      </div>
      <p v-if="error" class="auth-notice text-red" role="alert">{{ error }}</p>
      <p v-else-if="notice" class="auth-notice" role="status">{{ notice }}</p>
    </form>
  </OwnerPageShell>
</template>
