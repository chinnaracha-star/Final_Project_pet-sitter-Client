<script setup lang="ts">
defineProps<{
  open: boolean
}>()
const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
