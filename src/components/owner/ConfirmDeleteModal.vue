<script setup lang="ts">
import OwnerModal from './OwnerModal.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <OwnerModal :open="open" @close="emit('close')">
    <div class="flex flex-nowrap items-center justify-between gap-4 border-b border-primary-100 pb-4">
      <h2 class="text-xl font-bold leading-none">Delete Confirmation</h2>
      <button type="button" class="inline-flex size-10 shrink-0 items-center justify-center text-primary-900" aria-label="Close" @click="emit('close')">
        <svg viewBox="0 0 24 24" class="size-8" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
    <p class="mt-6 text-primary-500">Are you sure you want to delete this pet?</p>
    <div class="mt-8 flex items-center justify-between gap-3">
      <button type="button" class="min-h-12 rounded-full bg-orange-100 px-8 font-bold text-orange-700" @click="emit('close')">Cancel</button>
      <button type="button" class="auth-submit w-auto px-10 whitespace-nowrap" @click="emit('confirm')">Delete</button>
    </div>
  </OwnerModal>
</template>
