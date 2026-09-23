<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#232F3E]/60 backdrop-blur-[2px]"
        @click.self="emit('close')"
      >
        <div
          class="w-full max-w-[440px] rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header with Title and Close (X) -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 class="text-[17px] sm:text-lg font-bold text-[#181A20] tracking-tight">
              Booking Confirmation
            </h3>
            <button
              type="button"
              class="size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close"
              @click="emit('close')"
            >
              <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body Message -->
          <div class="py-6">
            <p class="text-[14.5px] text-[#707687] leading-relaxed">
              Are you sure to booking this pet sitter?
            </p>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <!-- Cancel Button -->
            <button
              type="button"
              class="px-7 py-2.5 rounded-full bg-[#FFF1EC] hover:bg-[#FFE5DC] text-[#FF6433] font-bold text-sm transition-colors cursor-pointer"
              @click="emit('close')"
            >
              Cancel
            </button>

            <!-- Yes, I'm sure Button -->
            <button
              type="button"
              class="px-7 py-2.5 rounded-full bg-[#FF6433] hover:bg-[#E2480A] text-white font-bold text-sm shadow-md shadow-[#FF6433]/20 transition-all cursor-pointer"
              @click="emit('confirm')"
            >
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
