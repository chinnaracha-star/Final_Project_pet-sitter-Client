<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { CreditCardInfo, PaymentMethod } from '../../types/booking'

const props = withDefaults(
  defineProps<{
    initialMethod?: PaymentMethod
    initialCard?: CreditCardInfo
  }>(),
  {
    initialMethod: 'credit_card',
    initialCard: () => ({
      cardNumber: '',
      cardOwner: '',
      expiryDate: '',
      cvv: '',
    }),
  }
)

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'confirm', payload: { method: PaymentMethod; card?: CreditCardInfo }): void
}>()

const activeMethod = ref<PaymentMethod>(props.initialMethod)

const card = reactive<CreditCardInfo>({
  cardNumber: props.initialCard?.cardNumber || '4111 2222 3333 4444',
  cardOwner: props.initialCard?.cardOwner || 'Jane Doe',
  expiryDate: props.initialCard?.expiryDate || '12/28',
  cvv: props.initialCard?.cvv || '123',
})

watch(
  () => props.initialCard,
  (newCard) => {
    if (newCard) {
      if (!card.cardNumber && newCard.cardNumber) card.cardNumber = newCard.cardNumber
      if (!card.cardOwner && newCard.cardOwner) card.cardOwner = newCard.cardOwner
      if (!card.expiryDate && newCard.expiryDate) card.expiryDate = newCard.expiryDate
      if (!card.cvv && newCard.cvv) card.cvv = newCard.cvv
    }
  },
  { deep: true }
)

const errors = reactive({
  cardNumber: '',
  cardOwner: '',
  expiryDate: '',
  cvv: '',
})

const hasSubmitted = ref(false)

// Formatting Card Number: automatically format as digits with spacing or dashes
function formatCardNumber(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '').slice(0, 16)
  // Format as xxxx-xxxx-xxxx-xxxx
  const parts = []
  for (let i = 0; i < raw.length; i += 4) {
    parts.push(raw.substring(i, i + 4))
  }
  card.cardNumber = parts.join(' ')
  if (hasSubmitted.value) validateField('cardNumber')
}

// Formatting Expiry Date: MM/YY
function formatExpiryDate(e: Event) {
  const input = e.target as HTMLInputElement
  let raw = input.value.replace(/\D/g, '').slice(0, 4)
  if (raw.length >= 3) {
    raw = `${raw.slice(0, 2)}/${raw.slice(2)}`
  }
  card.expiryDate = raw
  if (hasSubmitted.value) validateField('expiryDate')
}

// Formatting CVV: digits only up to 4
function formatCvv(e: Event) {
  const input = e.target as HTMLInputElement
  card.cvv = input.value.replace(/\D/g, '').slice(0, 4)
  if (hasSubmitted.value) validateField('cvv')
}

function validateField(field: 'cardNumber' | 'cardOwner' | 'expiryDate' | 'cvv'): boolean {
  if (activeMethod.value !== 'credit_card') {
    errors[field] = ''
    return true
  }

  if (field === 'cardNumber') {
    const digits = card.cardNumber.replace(/\D/g, '')
    if (!digits) {
      errors.cardNumber = 'Please enter your card number'
      return false
    }
    if (digits.length < 15 || digits.length > 16) {
      errors.cardNumber = 'Please enter a valid 16-digit card number'
      return false
    }
    errors.cardNumber = ''
    return true
  }

  if (field === 'cardOwner') {
    if (!card.cardOwner.trim()) {
      errors.cardOwner = 'Please enter card owner name'
      return false
    }
    errors.cardOwner = ''
    return true
  }

  if (field === 'expiryDate') {
    const raw = card.expiryDate.trim()
    if (!raw) {
      errors.expiryDate = 'Please enter card expiry date'
      return false
    }
    const [mm, yy] = raw.split('/')
    const month = parseInt(mm, 10)
    if (!month || month < 1 || month > 12 || !yy || yy.length !== 2) {
      errors.expiryDate = 'Please enter valid MM/YY'
      return false
    }
    errors.expiryDate = ''
    return true
  }

  if (field === 'cvv') {
    const digits = card.cvv.replace(/\D/g, '')
    if (!digits) {
      errors.cvv = 'Please enter CVC/CVV'
      return false
    }
    if (digits.length < 3 || digits.length > 4) {
      errors.cvv = 'Must be 3 or 4 digits'
      return false
    }
    errors.cvv = ''
    return true
  }

  return true
}

function handleConfirm() {
  hasSubmitted.value = true

  if (activeMethod.value === 'credit_card') {
    const isNumValid = validateField('cardNumber')
    const isOwnerValid = validateField('cardOwner')
    const isExpValid = validateField('expiryDate')
    const isCvvValid = validateField('cvv')

    if (!isNumValid || !isOwnerValid || !isExpValid || !isCvvValid) {
      return
    }

    emit('confirm', {
      method: 'credit_card',
      card: { ...card },
    })
  } else {
    // Cash payment directly confirmed
    emit('confirm', {
      method: 'cash',
    })
  }
}
</script>

<template>
  <div class="rounded-3xl bg-white p-6 sm:p-10 shadow-sm border border-gray-100">
    <!-- Payment Method Selector Tabs -->
    <div class="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
      <!-- Credit Card Tab -->
      <button
        type="button"
        class="h-14 sm:h-16 rounded-full flex items-center justify-center gap-3 text-sm sm:text-base font-bold transition-all cursor-pointer select-none"
        :class="[
          activeMethod === 'credit_card'
            ? 'border-2 border-[#FF6433] text-[#FF6433] bg-white shadow-sm'
            : 'border border-gray-200 text-[#707687] hover:border-gray-300 bg-white'
        ]"
        @click="activeMethod = 'credit_card'"
      >
        <!-- Credit Card Icon -->
        <svg class="size-5 sm:size-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="6" y1="15" x2="10" y2="15" />
        </svg>
        <span>Credit Card</span>
      </button>

      <!-- Cash Tab -->
      <button
        type="button"
        class="h-14 sm:h-16 rounded-full flex items-center justify-center gap-3 text-sm sm:text-base font-bold transition-all cursor-pointer select-none"
        :class="[
          activeMethod === 'cash'
            ? 'border-2 border-[#FF6433] text-[#FF6433] bg-white shadow-sm'
            : 'border border-gray-200 text-[#707687] hover:border-gray-300 bg-white'
        ]"
        @click="activeMethod = 'cash'"
      >
        <!-- Cash / Wallet Icon -->
        <svg class="size-5 sm:size-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>Cash</span>
      </button>
    </div>

    <!-- VIEW A: Credit Card Form -->
    <div v-if="activeMethod === 'credit_card'" class="animate-in fade-in duration-200">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <!-- Card Number* -->
        <div>
          <label for="card-number" class="block text-sm font-semibold text-[#181A20] mb-2">
            Card Number<span class="text-rose-500">*</span>
          </label>
          <input
            id="card-number"
            :value="card.cardNumber"
            type="text"
            placeholder="xxx-xxxx-x-xx-xx"
            class="w-full px-4 py-3.5 rounded-xl border text-sm text-[#181A20] placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-1"
            :class="[
              errors.cardNumber
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/10'
                : 'border-gray-200 focus:border-[#FF6433] focus:ring-[#FF6433]'
            ]"
            @input="formatCardNumber"
            @blur="validateField('cardNumber')"
          />
          <p v-if="errors.cardNumber" class="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <svg class="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errors.cardNumber }}</span>
          </p>
        </div>

        <!-- Card Owner* -->
        <div>
          <label for="card-owner" class="block text-sm font-semibold text-[#181A20] mb-2">
            Card Owner<span class="text-rose-500">*</span>
          </label>
          <input
            id="card-owner"
            v-model="card.cardOwner"
            type="text"
            placeholder="Card owner name"
            class="w-full px-4 py-3.5 rounded-xl border text-sm text-[#181A20] placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-1"
            :class="[
              errors.cardOwner
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/10'
                : 'border-gray-200 focus:border-[#FF6433] focus:ring-[#FF6433]'
            ]"
            @input="hasSubmitted && validateField('cardOwner')"
            @blur="validateField('cardOwner')"
          />
          <p v-if="errors.cardOwner" class="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <svg class="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errors.cardOwner }}</span>
          </p>
        </div>

        <!-- Expiry Date* -->
        <div>
          <label for="card-expiry" class="block text-sm font-semibold text-[#181A20] mb-2">
            Expiry Date<span class="text-rose-500">*</span>
          </label>
          <input
            id="card-expiry"
            :value="card.expiryDate"
            type="text"
            placeholder="MM/YY"
            maxlength="5"
            class="w-full px-4 py-3.5 rounded-xl border text-sm text-[#181A20] placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-1"
            :class="[
              errors.expiryDate
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/10'
                : 'border-gray-200 focus:border-[#FF6433] focus:ring-[#FF6433]'
            ]"
            @input="formatExpiryDate"
            @blur="validateField('expiryDate')"
          />
          <p v-if="errors.expiryDate" class="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <svg class="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errors.expiryDate }}</span>
          </p>
        </div>

        <!-- CVC/CVV* -->
        <div>
          <label for="card-cvv" class="block text-sm font-semibold text-[#181A20] mb-2">
            CVC/CVV<span class="text-rose-500">*</span>
          </label>
          <input
            id="card-cvv"
            :value="card.cvv"
            type="password"
            placeholder="xxx"
            maxlength="4"
            class="w-full px-4 py-3.5 rounded-xl border text-sm text-[#181A20] placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-1"
            :class="[
              errors.cvv
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/10'
                : 'border-gray-200 focus:border-[#FF6433] focus:ring-[#FF6433]'
            ]"
            @input="formatCvv"
            @blur="validateField('cvv')"
          />
          <p v-if="errors.cvv" class="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <svg class="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errors.cvv }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- VIEW B: Cash Instruction -->
    <div v-else class="animate-in fade-in duration-200">
      <div class="rounded-2xl bg-[#F8F9FC] p-10 sm:p-14 flex flex-col items-center justify-center text-center min-h-[260px] border border-gray-100/70">
        <!-- Pink Cute Paw Icon -->
        <div class="size-20 sm:size-24 text-[#FF70A6] mb-5 flex items-center justify-center">
          <svg class="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
            <!-- 4 Toe Beans -->
            <ellipse cx="27" cy="38" rx="8" ry="11" transform="rotate(-15 27 38)" />
            <ellipse cx="43" cy="26" rx="8.5" ry="12" transform="rotate(-4 43 26)" />
            <ellipse cx="58" cy="26" rx="8.5" ry="12" transform="rotate(4 58 26)" />
            <ellipse cx="73" cy="38" rx="8" ry="11" transform="rotate(15 73 38)" />
            <!-- Main Curved Paw Pad -->
            <path d="M33 55 C26 50 18 59 23 69 C27 77 39 83 50 83 C61 83 73 77 77 69 C82 59 74 50 67 55 C62 58 56 54 50 54 C44 54 38 58 33 55 Z" />
          </svg>
        </div>

        <!-- Cash Instruction Text -->
        <p class="text-sm sm:text-[14.5px] text-[#707687] leading-relaxed max-w-sm mx-auto font-medium">
          If you want to pay by cash,<br />
          you are required to make a cash payment<br />
          upon arrival at the pet sitter's location.
        </p>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="flex items-center justify-between pt-10 mt-6 border-t border-gray-100">
      <button
        type="button"
        class="px-8 py-3 rounded-full bg-[#FFF1EC] hover:bg-[#FFE5DC] text-[#FF6433] font-bold text-sm transition-colors cursor-pointer"
        @click="emit('back')"
      >
        Back
      </button>

      <button
        type="button"
        class="px-9 py-3 rounded-full bg-[#FF6433] hover:bg-[#E2480A] text-white font-bold text-sm transition-all shadow-md shadow-[#FF6433]/20 cursor-pointer"
        @click="handleConfirm"
      >
        Confirm Booking
      </button>
    </div>
  </div>
</template>
