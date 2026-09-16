<script setup lang="ts">
const emit = defineEmits<{
  facebook: []
  google: []
}>()
</script>

<template>
  <div class="w-full">
    <p class="mt-7 mb-4 text-center text-body-3 text-primary-500">Or Continue With</p>
    <div class="flex gap-3.5">
      <button
        type="button"
        class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary-100 text-sm font-semibold text-primary-900"
        @click="emit('facebook')"
      >
        <span class="grid size-[22px] place-items-center rounded-full bg-[#1877f2] text-[15px] font-extrabold leading-none text-white" aria-hidden="true">f</span>
        Facebook
      </button>
      <button
        type="button"
        class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary-100 text-sm font-semibold text-primary-900"
        @click="emit('google')"
      >
        <svg class="size-[18px]" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
          <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z" />
          <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4V6.5H1.4C.5 8.2 0 10.1 0 12s.5 3.8 1.4 5.5l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1C6.3 6.8 8.9 4.8 12 4.8z" />
        </svg>
        Gmail
      </button>
    </div>
  </div>
</template>
