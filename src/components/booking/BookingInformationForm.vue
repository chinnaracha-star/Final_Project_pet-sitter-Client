<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { BookingCustomerInfo } from '../../types/booking'

const props = defineProps<{
  initialData?: BookingCustomerInfo
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'next', data: BookingCustomerInfo): void
}>()

const form = reactive<BookingCustomerInfo>({
  name: props.initialData?.name || 'Jane Doe',
  email: props.initialData?.email || 'jane.doe@example.com',
  phone: props.initialData?.phone || '081-234-5678',
  additionalMessage: props.initialData?.additionalMessage || 'Please take good care of my pets!',
})

// Watch for external prop updates
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      if (!form.name && newData.name) form.name = newData.name
      if (!form.email && newData.email) form.email = newData.email
      if (!form.phone && newData.phone) form.phone = newData.phone
      if (!form.additionalMessage && newData.additionalMessage) form.additionalMessage = newData.additionalMessage
    }
  },
  { deep: true }
)

const errors = reactive({
  name: '',
  email: '',
  phone: '',
})

const hasSubmitted = ref(false)

function validateField(field: 'name' | 'email' | 'phone'): boolean {
  if (field === 'name') {
    if (!form.name.trim()) {
      errors.name = 'Please enter your full name'
      return false
    }
    errors.name = ''
    return true
  }

  if (field === 'email') {
    const trimmed = form.email.trim()
    if (!trimmed) {
      errors.email = 'Please enter your email address'
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      errors.email = 'Please enter a valid email address'
      return false
    }
    errors.email = ''
    return true
  }

  if (field === 'phone') {
    const trimmed = form.phone.trim()
    if (!trimmed) {
      errors.phone = 'Please enter your phone number'
      return false
    }
    // Clean digits check: at least 8 to 15 digits or standard phone pattern
    const digitsOnly = trimmed.replace(/\D/g, '')
    if (digitsOnly.length < 9 || digitsOnly.length > 15) {
      errors.phone = 'Please enter a valid phone number (e.g. 081-234-5678)'
      return false
    }
    errors.phone = ''
    return true
  }

  return true
}

function handleInput(field: 'name' | 'email' | 'phone') {
  if (hasSubmitted.value) {
    validateField(field)
  } else if (errors[field]) {
    errors[field] = ''
  }
}

function handleNext() {
  hasSubmitted.value = true

  const isNameValid = validateField('name')
  const isEmailValid = validateField('email')
  const isPhoneValid = validateField('phone')

  if (!isNameValid || !isEmailValid || !isPhoneValid) {
    return
  }

  emit('next', {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    additionalMessage: form.additionalMessage?.trim() || '',
  })
}
</script>

<template>
  <div class="rounded-3xl bg-white p-6 sm:p-10 shadow-sm border border-gray-100">
    <form @submit.prevent="handleNext" novalidate class="space-y-6">
      <!-- Your Name* -->
      <div>
        <label for="booking-name" class="block text-sm font-semibold text-[#181A20] mb-2">
          Your Name<span class="text-rose-500">*</span>
        </label>
        <input
          id="booking-name"
          v-model="form.name"
          type="text"
          placeholder="Full name"
          class="w-full px-4 py-3.5 rounded-xl border text-sm text-[#181A20] placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-1"
          :class="[
            errors.name
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/10'
              : 'border-gray-200 focus:border-[#FF6433] focus:ring-[#FF6433]'
          ]"
          @input="handleInput('name')"
          @blur="validateField('name')"
        />
        <p v-if="errors.name" class="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
          <svg class="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ errors.name }}</span>
        </p>
      </div>

      <!-- Email* & Phone* Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <!-- Email* -->
        <div>
          <label for="booking-email" class="block text-sm font-semibold text-[#181A20] mb-2">
            Email<span class="text-rose-500">*</span>
          </label>
          <input
            id="booking-email"
            v-model="form.email"
            type="email"
            placeholder="youremail@company.com"
            class="w-full px-4 py-3.5 rounded-xl border text-sm text-[#181A20] placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-1"
            :class="[
              errors.email
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/10'
                : 'border-gray-200 focus:border-[#FF6433] focus:ring-[#FF6433]'
            ]"
            @input="handleInput('email')"
            @blur="validateField('email')"
          />
          <p v-if="errors.email" class="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <svg class="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errors.email }}</span>
          </p>
        </div>

        <!-- Phone* -->
        <div>
          <label for="booking-phone" class="block text-sm font-semibold text-[#181A20] mb-2">
            Phone<span class="text-rose-500">*</span>
          </label>
          <input
            id="booking-phone"
            v-model="form.phone"
            type="tel"
            placeholder="xxx-xxx-xxxx"
            class="w-full px-4 py-3.5 rounded-xl border text-sm text-[#181A20] placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-1"
            :class="[
              errors.phone
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/10'
                : 'border-gray-200 focus:border-[#FF6433] focus:ring-[#FF6433]'
            ]"
            @input="handleInput('phone')"
            @blur="validateField('phone')"
          />
          <p v-if="errors.phone" class="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <svg class="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errors.phone }}</span>
          </p>
        </div>
      </div>

      <!-- Divider -->
      <hr class="border-t border-gray-100 my-8" />

      <!-- Additional Message (To pet sitter) -->
      <div>
        <label for="booking-message" class="block text-sm font-semibold text-[#181A20] mb-2">
          Additional Message (To pet sitter)
        </label>
        <textarea
          id="booking-message"
          v-model="form.additionalMessage"
          rows="5"
          placeholder=""
          class="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-[#181A20] placeholder:text-gray-400 resize-none transition-colors focus:outline-none focus:border-[#FF6433] focus:ring-1 focus:ring-[#FF6433]"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-6">
        <button
          type="button"
          class="px-8 py-3 rounded-full bg-[#FFF1EC] hover:bg-[#FFE5DC] text-[#FF6433] font-bold text-sm transition-colors cursor-pointer"
          @click="emit('back')"
        >
          Back
        </button>

        <button
          type="submit"
          class="px-9 py-3 rounded-full bg-[#FF6433] hover:bg-[#E2480A] text-white font-bold text-sm transition-all shadow-md shadow-[#FF6433]/20 cursor-pointer"
        >
          Next
        </button>
      </div>
    </form>
  </div>
</template>
