<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Navbar } from '../components'
import ConfirmDeleteModal from '../components/owner/ConfirmDeleteModal.vue'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import PetForm from '../components/owner/PetForm.vue'
import { uploadOwnerMedia } from '../services/ownerApi'
import { useOwnerPetsStore } from '../stores/ownerPets'
import type { OwnerPet } from '../types/owner'

const route = useRoute()
const router = useRouter()
const pets = useOwnerPetsStore()
const showDelete = ref(false)
const error = ref('')
const pet = ref<OwnerPet | undefined>()

const isCreate = computed(() => route.path === '/owner/pets/new')
const petId = computed(() => Number(route.params.id))

onMounted(async () => {
  if (isCreate.value) return
  try {
    pet.value = await pets.getById(petId.value)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'This pet was not found.'
  }
})

async function save(payload: Omit<OwnerPet, 'id'>, photo: File | null) {
  error.value = ''
  try {
    const avatarUrl = photo ? (await uploadOwnerMedia(photo, 'pet')).url : payload.avatarUrl
    const next = { ...payload, avatarUrl }
    if (isCreate.value) {
      await pets.createPet(next)
    } else {
      await pets.updatePet(petId.value, next)
    }
    void router.push('/owner/pets')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save pet'
  }
}

async function confirmDelete() {
  try {
    await pets.removePet(petId.value)
    showDelete.value = false
    void router.push('/owner/pets')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not delete pet'
  }
}
</script>

<template>
  <OwnerPageShell title="Your Pet">
    <template #nav>
      <Navbar />
    </template>

    <p v-if="error" class="mb-6 auth-notice" role="alert">{{ error }}</p>
    <p v-else-if="!isCreate && !pet" class="text-primary-500">This pet was not found.</p>
    <PetForm
      v-else
      :mode="isCreate ? 'create' : 'edit'"
      :pet="pet"
      @save="save"
      @cancel="router.push('/owner/pets')"
      @remove="showDelete = true"
    />
    <ConfirmDeleteModal :open="showDelete" @close="showDelete = false" @confirm="confirmDelete" />
  </OwnerPageShell>
</template>
