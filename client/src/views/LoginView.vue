<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SocialLoginButtons from '../components/SocialLoginButtons.vue'
import { useAuthRole } from '../composables/useAuthRole'

const router = useRouter()
const { isOwner, registerTo, setRole } = useAuthRole()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const submitted = ref(false)
const socialNotice = ref('')

function submitLogin() {
  submitted.value = true
  socialNotice.value = ''
  void router.push(isOwner.value ? '/owner/profile' : '/sitter/profile')
}

function continueWith(provider: 'Facebook' | 'Google') {
  socialNotice.value = `${provider} login is ready on this screen, but OAuth is not connected yet.`
}
</script>

<template>
  <main class="auth-page">
    <form class="auth-form" @submit.prevent="submitLogin">
      <p v-if="!isOwner" class="mb-8 text-[26px] font-extrabold text-neutral-900">
        S<span class="italic text-brand">i</span>tter<strong class="align-top text-[20px] text-[#18bd83]">✦</strong>
      </p>
      <h1 class="auth-title">{{ isOwner ? 'Welcome back!' : 'Welcome Back!' }}</h1>
      <p class="auth-subtitle">
        {{ isOwner ? 'Find your perfect pet sitter with us' : 'Become the best Pet Sitter with us' }}
      </p>

      <div class="mb-8 flex w-full rounded-full bg-[#f7f7fc] p-1" aria-label="Account type">
       <button
        type="button"
        class="w-1/2 rounded-full py-2.5 text-sm font-bold"
        :class="isOwner ? 'border border-brand-soft bg-white text-brand-soft' : 'text-[#9296a5]'"
        :aria-current="isOwner ? 'page' : undefined"
        @click="setRole('owner')"
       >
        Owner
       </button>
       <button
        type="button"
        class="w-1/2 rounded-full py-2.5 text-sm font-bold"
        :class="!isOwner ? 'border border-brand-soft bg-white text-brand-soft' : 'text-[#9296a5]'"
        :aria-current="!isOwner ? 'page' : undefined"
        @click="setRole('sitter')"
       >
        Sitter
       </button>
     </div>

      <label class="auth-label" for="login-email">Email</label>
      <input
        id="login-email"
        v-model.trim="email"
        class="auth-input"
        type="email"
        autocomplete="email"
        placeholder="email@company.com"
        required
      />

      <label class="auth-label" for="login-password">Password</label>
      <input
        id="login-password"
        v-model="password"
        class="auth-input"
        type="password"
        autocomplete="current-password"
        :placeholder="isOwner ? 'email@company.com' : undefined"
        required
      />

      <div class="mt-3.5 mb-[22px] flex items-center justify-between">
        <label v-if="isOwner" class="inline-flex items-center gap-2 text-[13px] text-slate-500">
          <input v-model="rememberMe" class="size-[15px] accent-brand" type="checkbox" />
          Remember?
        </label>
        <span v-else></span>
        <span class="text-[13px] text-brand">{{ isOwner ? 'Forget Password?' : 'Forgot Password?' }}</span>
      </div>

      <button class="auth-submit" type="submit">Login</button>
      <SocialLoginButtons @facebook="continueWith('Facebook')" @google="continueWith('Google')" />
      <p v-if="submitted || socialNotice" class="auth-notice" role="status">
        {{
          socialNotice
            || (isOwner
              ? 'Owner login is ready. Next screens can use this session after the Spring Boot API is connected.'
              : 'Sitter login is ready, but it is not connected to the Spring Boot API yet.')
        }}
      </p>
      <p class="auth-switch">
        {{ isOwner ? "Don't have any account?" : "Don't have a Pet Sitter account?" }}
        <RouterLink :to="registerTo">Register</RouterLink>
      </p>
    </form>
  </main>
</template>
