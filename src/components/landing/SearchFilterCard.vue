<script setup lang="ts">
import { ref } from 'vue'

import type { SearchFilterState } from '../../types/landing'
export type { SearchFilterState }

const props = withDefaults(
  defineProps<{
    initialPetTypes?: string[]
    initialRating?: number | null
    initialExperience?: string
  }>(),
  {
    initialPetTypes: () => [],
    initialRating: null,
    initialExperience: '0-2 Years',
  },
)

const emit = defineEmits<{
  (e: 'search', filters: SearchFilterState): void
}>()

const petTypesList = ['Dog', 'Cat', 'Bird', 'Rabbit'] as const
const selectedPetTypes = ref<string[]>([...props.initialPetTypes])
const selectedRating = ref<number | null>(props.initialRating)
const selectedExperience = ref<string>(props.initialExperience)

const experienceOptions = [
  '0-2 Years',
  '3-5 Years',
  '5+ Years',
]

function togglePetType(type: string) {
  const index = selectedPetTypes.value.indexOf(type)
  if (index > -1) {
    selectedPetTypes.value.splice(index, 1)
  } else {
    selectedPetTypes.value.push(type)
  }
}

function setRating(r: number) {
  if (selectedRating.value === r) {
    selectedRating.value = null // toggle off if already selected
  } else {
    selectedRating.value = r
  }
}

function handleSearch() {
  emit('search', {
    petTypes: [...selectedPetTypes.value],
    rating: selectedRating.value,
    experience: selectedExperience.value,
  })
}
</script>

<template>
  <div
    class="w-full bg-white rounded-2xl md:rounded-[26px] shadow-[0_16px_44px_-10px_rgba(0,0,0,0.08)] border border-[#E2E7F0] overflow-hidden transition-all"
  >
    <!-- Top Row: Pet Type (Edge-to-edge light grey background #F5F6F9) -->
    <div
      class="bg-[#F5F6F9] px-6 sm:px-8 py-3.5 sm:py-4.5 flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-[#E7ECF3]"
    >
      <span class="text-sm sm:text-[15px] font-bold text-[#232733]">Pet Type:</span>

      <div class="flex flex-wrap items-center gap-6 sm:gap-8">
        <label
          v-for="pet in petTypesList"
          :key="pet"
          class="inline-flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <input
            type="checkbox"
            :checked="selectedPetTypes.includes(pet)"
            class="w-[18px] h-[18px] rounded-[5px] border-[#CBD2DF] text-[#FF6525] focus:ring-0 cursor-pointer accent-[#FF6525] bg-white transition"
            @change="togglePetType(pet)"
          />
          <span
            class="text-sm sm:text-[15px] font-medium text-[#464B59] group-hover:text-[#FF6525] transition-colors"
          >
            {{ pet }}
          </span>
        </label>
      </div>
    </div>

    <!-- Bottom Row: Rating Buttons, Experience & Search Button -->
    <div
      class="bg-white px-6 sm:px-8 py-3.5 sm:py-4.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-3"
    >
      <!-- Rating Filters (Each star group in its own bordered card) -->
      <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <span class="text-sm sm:text-[15px] font-bold text-[#232733] mr-0.5">Rating:</span>

        <div class="flex items-center gap-1.5 sm:gap-2">
          <button
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            type="button"
            class="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border bg-white transition cursor-pointer select-none shrink-0"
            :class="[
              selectedRating === star
                ? 'border-[#1CCD83] bg-emerald-50/60 ring-1 ring-[#1CCD83]'
                : 'border-[#E2E6EE] hover:border-[#1CCD83]/70 hover:bg-gray-50/70'
            ]"
            :title="`Filter by ${star} star${star > 1 ? 's' : ''}`"
            @click="setRating(star)"
          >
            <span class="text-xs sm:text-sm font-bold text-[#414552] leading-none">{{ star }}</span>
            <div class="inline-flex items-center gap-0.5">
              <svg
                v-for="s in star"
                :key="s"
                class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1CCD83] fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Experience Dropdown & Search Button -->
      <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-1 md:pt-0">
        <div class="inline-flex items-center gap-2 sm:gap-2.5">
          <span class="text-xs sm:text-sm font-medium text-[#292A36] whitespace-nowrap">
            Experience:
          </span>
          <div class="relative inline-block">
            <select
              v-model="selectedExperience"
              class="appearance-none bg-white border border-[#E0E2EC] rounded-lg pl-3 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm font-normal text-[#8F92A1] focus:outline-none focus:border-[#FF6525] focus:ring-1 focus:ring-[#FF6525] cursor-pointer min-w-[110px]"
            >
              <option v-for="opt in experienceOptions" :key="opt" :value="opt" class="text-[#292A36]">
                {{ opt }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8F92A1]">
              <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 10 6">
                <path d="M0 0.5L5 5.5L10 0.5H0Z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Search Button -->
        <button
          type="button"
          class="bg-[#FF6525] hover:bg-[#FA5510] active:scale-95 text-white font-bold text-sm sm:text-[15px] px-8 sm:px-9 py-2.5 sm:py-3 rounded-full transition duration-150 shadow-sm hover:shadow-md cursor-pointer"
          @click="handleSearch"
        >
          Search
        </button>
      </div>
    </div>
  </div>
</template>
