<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SocialLoginButtons from '../components/SocialLoginButtons.vue'
import { useAuthRole } from '../composables/useAuthRole'

const router = useRouter()
const { isOwner, loginTo, setRole } = useAuthRole()

const showPassword = ref(false)
const submitted = ref(false)
const socialNotice = ref('')
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')

function submitRegister() {
  submitted.value = true
  socialNotice.value = ''
  void router.push(isOwner.value ? '/owner/profile' : '/sitter/profile')
}

function continueWith(provider: 'Facebook' | 'Google') {
  socialNotice.value = `${provider} sign-up is ready on this screen, but OAuth is not connected yet.`
}
</script>

<template>
  <main class="auth-page">
    <form class="auth-form" @submit.prevent="submitRegister">
      <h1 class="auth-title">Join Us!</h1>
      <p class="auth-subtitle">Find your perfect pet sitter with us</p>

      <div class="mb-8 flex w-full rounded-full bg-primary-100/40 p-1" aria-label="Account type">
        <button
          type="button"
          class="w-1/2 rounded-full py-2.5 text-sm font-bold"
          :class="isOwner ? 'border border-orange-700 bg-white text-orange-700' : 'text-primary-500'"
          :aria-current="isOwner ? 'page' : undefined"
          @click="setRole('owner')"
        >
          Owner
        </button>
        <button
          type="button"
          class="w-1/2 rounded-full py-2.5 text-sm font-bold"
          :class="!isOwner ? 'border border-orange-700 bg-white text-orange-700' : 'text-primary-500'"
          :aria-current="!isOwner ? 'page' : undefined"
          @click="setRole('sitter')"
        >
          Sitter
        </button>
      </div>

      <template v-if="!isOwner">
        <label class="auth-label" for="register-name">Name</label>
        <input
          id="register-name"
          v-model.trim="name"
          class="auth-input"
          type="text"
          autocomplete="name"
          placeholder="Your name"
          required
        />
      </template>

      <label class="auth-label" for="register-email">Email</label>
      <input
        id="register-email"
        v-model.trim="email"
        class="auth-input"
        type="email"
        autocomplete="email"
        placeholder="email@company.com"
        required
      />

      <label class="auth-label" for="register-phone">Phone</label>
      <input
        id="register-phone"
        v-model.trim="phone"
        class="auth-input"
        type="tel"
        autocomplete="tel"
        placeholder="Your phone number"
        required
      />

      <label class="auth-label" for="register-password">Password</label>
      <div v-if="!isOwner" class="relative">
        <input
          id="register-password"
          v-model="password"
          class="auth-input pr-[72px]"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="Create your password"
          minlength="8"
          required
        />
        <button
          type="button"
          class="absolute top-1 right-2 h-10 border-0 bg-white text-body-3 text-primary-500"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
      <input
        v-else
        id="register-password"
        v-model="password"
        class="auth-input"
        type="password"
        autocomplete="new-password"
        placeholder="Create your password"
        minlength="8"
        required
      />

      <button class="auth-submit mt-7" type="submit">
        {{ isOwner ? 'Register' : 'Register as Sitter' }}
      </button>
      <SocialLoginButtons @facebook="continueWith('Facebook')" @google="continueWith('Google')" />
      <p v-if="submitted || socialNotice" class="auth-notice" role="status">
        {{
          socialNotice
            || (isOwner
              ? 'Owner registration is ready. An account will be created after the Spring Boot API is connected.'
              : 'The sitter form is ready, but an account is not created until the Spring Boot API is connected.')
        }}
      </p>
      <p class="auth-switch">
        Already have an account?
        <RouterLink :to="loginTo">Login</RouterLink>
      </p>
    </form>
  </main>
</template>
