<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import OwnerModal from '../components/owner/OwnerModal.vue'
import SocialLoginButtons from '../components/SocialLoginButtons.vue'
import { useAuthRole } from '../composables/useAuthRole'
import { useAuthStore } from '../stores/auth'

const { isOwner, loginTo, setRole } = useAuthRole()
const auth = useAuthStore()
const router = useRouter()

const showPassword = ref(false)
const socialNotice = ref('')
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')

function submitRegister() {
  socialNotice.value = ''
  void auth.register({
    name: name.value,
    email: email.value,
    phone: phone.value,
    password: password.value,
    role: isOwner.value ? 'owner' : 'pet-sitter',
  }).then(result => {
    if (result === 'check-email') {
      socialNotice.value = 'Please check your email for verification.'
      return
    }
    void router.push(isOwner.value ? '/owner/profile' : '/sitter/profile')
  }).catch(cause => {
    socialNotice.value = cause instanceof Error ? cause.message : 'Registration failed'
  })
}

function continueWith(provider: 'Facebook' | 'Google') {
  socialNotice.value = `${provider} sign-up is ready on this screen, but OAuth is not connected yet.`
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-art" aria-hidden="true">
      <img src="/image/paw-yellow.svg" alt="" class="auth-art-paw" />
      <img src="/image/corner-bottom-left.svg" alt="" class="auth-art-corner" />
    </div>
    <form class="auth-form" @submit.prevent="submitRegister">
      <h1 class="auth-title">Join Us!</h1>
      <p class="auth-subtitle">
        {{ isOwner ? 'Find your perfect pet sitter with us' : 'Become the best Pet Sitter with us' }}
      </p>

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
          @click="setRole('pet-sitter')"
        >
          Sitter
        </button>
      </div>

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
      <div class="relative">
        <input
          id="register-password"
          v-model="password"
          class="auth-input pr-12"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="Create your password"
          minlength="8"
          required
        />
        <button
          type="button"
          class="absolute inset-y-0 right-2 grid w-10 place-items-center border-0 bg-transparent p-0"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          <img :src="showPassword ? '/icon/eye-off.svg' : '/icon/eye.svg'" alt="" class="size-5" />
        </button>
      </div>

      <button class="auth-submit mt-7" type="submit">
        {{ isOwner ? 'Register as Owner' : 'Register as Sitter' }}
      </button>
      <SocialLoginButtons @facebook="continueWith('Facebook')" @google="continueWith('Google')" />
      <OwnerModal :open="socialNotice !== ''" @close="socialNotice = ''">
        <div class="flex flex-nowrap items-center justify-between gap-4 border-b border-primary-100 pb-4">
          <h2 class="text-xl font-bold leading-none">Notification</h2>
          <button type="button" class="inline-flex size-10 shrink-0 items-center justify-center text-primary-900" aria-label="Close" @click="socialNotice = ''">
            <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <p class="mt-6 text-primary-500">{{ socialNotice }}</p>
        <div class="mt-8 flex justify-end">
          <button type="button" class="auth-submit w-auto px-8 whitespace-nowrap" @click="socialNotice = ''">Close</button>
        </div>
      </OwnerModal>
      <p class="auth-switch">
        Already have an account?
        <RouterLink :to="loginTo">Login</RouterLink>
      </p>
    </form>
  </main>
</template>
