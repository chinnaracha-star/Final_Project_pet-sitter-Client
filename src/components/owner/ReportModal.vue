<script setup lang="ts">
import { ref, watch } from 'vue'
import OwnerModal from './OwnerModal.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [issue: string, description: string]
}>()

const issue = ref('')
const description = ref('')

watch(() => props.open, open => {
  if (open) {
    issue.value = ''
    description.value = ''
  }
})

function send() {
  emit('submit', issue.value.trim(), description.value.trim())
}
</script>

<template>
  <OwnerModal :open="open" @close="emit('close')">
    <form @submit.prevent="send">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-xl font-bold">Report</h2>
        <button type="button" class="text-2xl text-primary-500" aria-label="Close" @click="emit('close')">×</button>
      </div>
      <label class="auth-label" for="report-issue">Issue</label>
      <input id="report-issue" v-model.trim="issue" class="auth-input" placeholder="Subject" required />
      <label class="auth-label" for="report-description">Description</label>
      <textarea id="report-description" v-model.trim="description" class="min-h-32 w-full rounded-2xl border border-primary-100 px-[18px] py-3" placeholder="Describe detail..." />
      <div class="mt-8 flex justify-end gap-3">
        <button type="button" class="min-h-12 rounded-full bg-orange-100 px-8 font-bold text-orange-700" @click="emit('close')">Cancel</button>
        <button class="auth-submit px-8" type="submit">Send Report</button>
      </div>
    </form>
  </OwnerModal>
</template>
