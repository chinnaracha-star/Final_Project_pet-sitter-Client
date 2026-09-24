<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOwnerPetsStore } from '../../stores/ownerPets'
import type { OwnerPet } from '../../types/owner'
import ConfirmDeleteModal from '../owner/ConfirmDeleteModal.vue'

const props = defineProps<{
  modelValue: OwnerPet[]
}>()

const emit = defineEmits<{
  'update:modelValue': [pets: OwnerPet[]]
  back: []
  next: []
}>()

const router = useRouter()
const petsStore = useOwnerPetsStore()

// Delete confirmation modal state
const petToDelete = ref<OwnerPet | null>(null)
const showDeleteModal = ref(false)

function promptDeletePet(pet: OwnerPet) {
  petToDelete.value = pet
  showDeleteModal.value = true
}

function confirmDeletePet() {
  if (petToDelete.value) {
    const id = petToDelete.value.id
    void petsStore.removePet(id)
    selectedIds.value = selectedIds.value.filter(petId => petId !== id)
    showDeleteModal.value = false
    petToDelete.value = null
  }
}

// Local selected pet IDs
const selectedIds = computed({
  get: () => props.modelValue.map(p => p.id),
  set: (ids: number[]) => {
    const selected = petsStore.pets.filter(p => ids.includes(p.id))
    emit('update:modelValue', selected)
  },
})

function togglePet(pet: OwnerPet) {
  const current = [...selectedIds.value]
  const index = current.indexOf(pet.id)
  if (index === -1) {
    current.push(pet.id)
  } else {
    current.splice(index, 1)
  }
  selectedIds.value = current
}

function isSelected(petId: number) {
  return selectedIds.value.includes(petId)
}

function handleCreateNewPet() {
  void router.push({
    path: '/owner/pets/new',
    query: { redirect: '/booking/pet' },
  })
}

// Pet badge styles
function petBadgeClass(type: string) {
  switch (type.toLowerCase()) {
    case 'dog':
      return 'border border-emerald-400 text-emerald-600 bg-emerald-50/70'
    case 'cat':
      return 'border border-pink-400 text-pink-500 bg-pink-50/70'
    case 'bird':
      return 'border border-sky-400 text-sky-500 bg-sky-50/70'
    default:
      return 'border border-amber-400 text-amber-600 bg-amber-50/70'
  }
}
</script>

<template>
  <div class="w-full rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-100 text-[#1E2329]">
    <!-- Title -->
    <h3 class="text-[15px] font-bold text-[#1E2329] mb-5 tracking-tight">
      Choose your pet
    </h3>

    <!-- Pet Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <!-- Pet Cards from Store -->
      <div
        v-for="pet in petsStore.pets"
        :key="pet.id"
        class="relative h-[200px] rounded-2xl border p-4 flex flex-col items-center justify-center cursor-pointer select-none transition-all group"
        :class="[
          isSelected(pet.id)
            ? 'border-[#FF6433] bg-orange-50/20 ring-1 ring-[#FF6433] shadow-sm'
            : 'border-[#E0E2E7] hover:border-gray-300 bg-white hover:shadow-sm',
        ]"
        @click="togglePet(pet)"
      >
        <!-- Top-Left Delete Button -->
        <button
          type="button"
          class="absolute top-3 left-3 size-6.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer opacity-70 group-hover:opacity-100"
          title="Delete pet"
          aria-label="Delete pet"
          @click.stop="promptDeletePet(pet)"
        >
          <svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <!-- Top-Right Checkbox -->
        <div
          class="absolute top-3.5 right-3.5 size-5 rounded-md border flex items-center justify-center transition-colors"
          :class="[
            isSelected(pet.id)
              ? 'border-[#FF6433] bg-[#FF6433] text-white'
              : 'border-gray-300 bg-white',
          ]"
        >
          <svg
            v-if="isSelected(pet.id)"
            class="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- Pet Avatar -->
        <img
          :src="pet.avatarUrl"
          :alt="pet.name"
          class="size-20 rounded-full object-cover shadow-sm mb-3 pointer-events-none"
        />

        <!-- Pet Name -->
        <h4 class="text-[15px] font-bold text-[#1E2329] tracking-tight mb-1.5 truncate max-w-[120px]">
          {{ pet.name }}
        </h4>

        <!-- Pet Type Pill -->
        <span
          class="text-xs font-semibold px-3 py-0.5 rounded-full"
          :class="petBadgeClass(pet.petType)"
        >
          {{ pet.petType }}
        </span>
      </div>

      <!-- Create New Pet Card -->
      <div
        class="h-[200px] rounded-2xl bg-[#FFF5EE] hover:bg-[#FFEBE0] border border-orange-100 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group select-none"
        @click="handleCreateNewPet"
      >
        <div class="size-11 rounded-full border-2 border-[#FF6433] text-[#FF6433] flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span class="text-[14.5px] font-bold text-[#FF6433]">
          Create New Pet
        </span>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="flex items-center justify-between mt-10 pt-5 border-t border-gray-100">
      <!-- Back Button -->
      <button
        type="button"
        class="px-8 py-3 rounded-2xl bg-[#FFF2EC] hover:bg-[#FFE4D6] text-[#FF6433] font-bold text-[14.5px] transition-all cursor-pointer"
        @click="emit('back')"
      >
        Back
      </button>

      <!-- Next Button -->
      <button
        type="button"
        class="px-9 py-3 rounded-2xl font-bold text-[14.5px] transition-all cursor-pointer"
        :class="[
          selectedIds.length > 0
            ? 'bg-[#FF6433] hover:bg-[#E2480A] text-white shadow-md shadow-[#FF6433]/25 active:scale-[0.99]'
            : 'bg-[#DDE2EB] text-[#82869B] cursor-not-allowed',
        ]"
        :disabled="selectedIds.length === 0"
        @click="emit('next')"
      >
        Next
      </button>
    </div>

    <!-- Confirm Delete Pet Modal -->
    <ConfirmDeleteModal
      :open="showDeleteModal"
      :pet-name="petToDelete?.name"
      @close="showDeleteModal = false"
      @confirm="confirmDeletePet"
    />
  </div>
</template>
