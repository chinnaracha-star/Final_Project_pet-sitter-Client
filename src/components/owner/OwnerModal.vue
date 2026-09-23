<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  wide?: boolean
}>(), {
  wide: false,
})
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
      <div class="w-full rounded-2xl bg-white p-6 shadow-xl" :class="wide ? 'max-w-[680px]' : 'max-w-[520px]'" role="dialog" aria-modal="true">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
