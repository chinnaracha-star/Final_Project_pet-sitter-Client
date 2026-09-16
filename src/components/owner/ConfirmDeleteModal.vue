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
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">Delete Confirmation</h2>
      <button type="button" class="text-2xl text-primary-500" aria-label="Close" @click="emit('close')">×</button>
    </div>
    <p class="mt-4 text-primary-500">Are you sure you want to delete this pet?</p>
    <div class="mt-8 flex justify-end gap-3">
      <button type="button" class="min-h-12 rounded-full bg-orange-100 px-8 font-bold text-orange-700" @click="emit('close')">Cancel</button>
      <button type="button" class="auth-submit px-8" @click="emit('confirm')">Delete</button>
    </div>
  </OwnerModal>
</template>
