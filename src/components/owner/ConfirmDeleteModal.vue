<script setup lang="ts">
import OwnerModal from './OwnerModal.vue'

defineProps<{
  open: boolean
  petName?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <OwnerModal :open="open" @close="emit('close')">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-[#1E2329]">Delete Confirmation</h2>
      <button type="button" class="text-2xl text-primary-500 hover:text-primary-900 cursor-pointer" aria-label="Close" @click="emit('close')">×</button>
    </div>
    <p class="mt-4 text-primary-500">
      Are you sure you want to delete <strong v-if="petName" class="text-[#1E2329]">{{ petName }}</strong><span v-else>this pet</span>?
    </p>
    <div class="mt-8 flex justify-end gap-3">
      <button type="button" class="min-h-12 rounded-full bg-orange-100 hover:bg-orange-200 px-8 font-bold text-orange-700 transition-colors cursor-pointer" @click="emit('close')">Cancel</button>
      <button type="button" class="auth-submit px-8 bg-red-500 hover:bg-red-600 border-red-500 text-white rounded-full font-bold transition-colors cursor-pointer" @click="emit('confirm')">Delete</button>
    </div>
  </OwnerModal>
</template>
