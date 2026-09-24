<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import OwnerModal from "../components/owner/OwnerModal.vue";
import SocialLoginButtons from "../components/SocialLoginButtons.vue";
import { useAuthRole } from "../composables/useAuthRole";
import { useAuthStore } from "../stores/auth";

const { isOwner, registerTo, setRole } = useAuthRole();
const auth = useAuthStore();
const router = useRouter();

const showPassword = ref(false);
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const notice = ref("");

async function submitLogin() {
  notice.value = "";
  try {
    const targetRole = isOwner.value ? "owner" : "pet-sitter";
    await auth.login(email.value, password.value, targetRole);
    void router.push(targetRole === "pet-sitter" ? "/sitter/profile" : "/owner/profile");
  } catch (cause) {
    notice.value = cause instanceof Error ? cause.message : "Login failed";
  }
}

function continueWith(provider: "Facebook" | "Google") {
  notice.value = `${provider} login is ready on this screen, but OAuth is not connected yet.`;
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-art" aria-hidden="true">
      <img src="/image/paw-yellow.svg" alt="" class="auth-art-paw" />
      <img src="/image/corner-bottom-left.svg" alt="" class="auth-art-corner" />
    </div>
    <form class="auth-form" @submit.prevent="submitLogin">
      <h1 class="auth-title">
        {{ isOwner ? "Welcome back!" : "Welcome Back!" }}
      </h1>
      <p class="auth-subtitle">
        {{
          isOwner
            ? "Find your perfect pet sitter with us"
            : "Become the best Pet Sitter with us"
        }}
      </p>

      <div
        class="mb-8 flex w-full rounded-full bg-primary-100/40 p-1"
        aria-label="Account type"
      >
        <button
          type="button"
          class="w-1/2 rounded-full py-2.5 text-sm font-bold"
          :class="
            isOwner
              ? 'border border-orange-700 bg-white text-orange-700'
              : 'text-primary-500'
          "
          :aria-current="isOwner ? 'page' : undefined"
          @click="setRole('owner')"
        >
          Owner
        </button>
        <button
          type="button"
          class="w-1/2 rounded-full py-2.5 text-sm font-bold"
          :class="
            !isOwner
              ? 'border border-orange-700 bg-white text-orange-700'
              : 'text-primary-500'
          "
          :aria-current="!isOwner ? 'page' : undefined"
          @click="setRole('pet-sitter')"
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
      <div class="relative">
        <input
          id="login-password"
          v-model="password"
          class="auth-input pr-12"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
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

      <div class="mt-3.5 mb-[22px] flex items-center" :class="isOwner ? 'justify-between' : 'justify-center'">
        <label
          v-if="isOwner"
          class="inline-flex items-center gap-2 text-body-3 text-primary-500"
        >
          <input
            v-model="rememberMe"
            class="size-[15px] accent-orange-700"
            type="checkbox"
          />
          Remember?
        </label>
        <span v-else></span>
        <span class="text-body-3 text-orange-700">{{
          isOwner ? "Forget Password?" : "Forgot Password?"
        }}</span>
      </div>

      <button class="auth-submit" type="submit">Login</button>
      <SocialLoginButtons
        v-if="isOwner"
        @facebook="continueWith('Facebook')"
        @google="continueWith('Google')"
      />
      <OwnerModal :open="notice !== ''" @close="notice = ''">
        <div class="flex flex-nowrap items-center justify-between gap-4 border-b border-primary-100 pb-4">
          <h2 class="text-xl font-bold leading-none">Notification</h2>
          <button type="button" class="inline-flex size-10 shrink-0 items-center justify-center text-primary-900" aria-label="Close" @click="notice = ''">
            <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <p class="mt-6 text-primary-500">{{ notice }}</p>
        <div class="mt-8 flex justify-end">
          <button type="button" class="auth-submit w-auto px-8 whitespace-nowrap" @click="notice = ''">Close</button>
        </div>
      </OwnerModal>
      <p class="auth-switch">
        {{
          isOwner
            ? "Don't have any account?"
            : "Don't have a Pet Sitter account?"
        }}
        <RouterLink :to="registerTo">Register</RouterLink>
      </p>
    </form>
  </main>
</template>
