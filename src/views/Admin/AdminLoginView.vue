<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const showPassword = ref(false);
const email = ref("");
const password = ref("");
const emailError = ref("");
const passwordError = ref("");

function submitLogin() {
  emailError.value = email.value === "adminnick@gmail.com" ? "" : "Incorrect email.";
  passwordError.value = password.value === "iamadmin555" ? "" : "Incorrect password.";

  if (emailError.value || passwordError.value) return;

  void router.push("/admin/petsitters");
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-art" aria-hidden="true">
      <img src="/image/paw-yellow.svg" alt="" class="auth-art-paw" />
      <img src="/image/corner-bottom-left.svg" alt="" class="auth-art-corner" />
    </div>
    <form class="auth-form" novalidate @submit.prevent="submitLogin">
      <h1 class="auth-title">Admin Login</h1>
      <p class="auth-subtitle">Sign in to manage pet sitter accounts</p>

      <div
        class="mb-8 flex w-full rounded-full bg-primary-100/40 p-1"
        aria-label="Account type"
      >
        <button
          type="button"
          class="w-1/3 rounded-full py-2.5 text-sm font-bold text-primary-500"
          @click="router.push('/login')"
        >
          Owner
        </button>
        <button
          type="button"
          class="w-1/3 rounded-full py-2.5 text-sm font-bold text-primary-500"
          @click="router.push('/login?role=sitter')"
        >
          Sitter
        </button>
        <button
          type="button"
          class="w-1/3 rounded-full border border-orange-700 bg-white py-2.5 text-sm font-bold text-orange-700"
          aria-current="page"
        >
          Admin
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
      />
      <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>

      <label class="auth-label" for="login-password">Password</label>
      <div class="relative">
        <input
          id="login-password"
          v-model="password"
          class="auth-input pr-12"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
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

      <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>

      <button class="auth-submit mt-12" type="submit">Login</button>
    </form>
  </main>
</template>
