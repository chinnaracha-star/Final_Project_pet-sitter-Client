<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Navbar } from '../components'
import ConfirmDeleteModal from '../components/owner/ConfirmDeleteModal.vue'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import PetForm from '../components/owner/PetForm.vue'
import { useOwnerPetsStore } from '../stores/ownerPets'
import type { OwnerPet } from '../types/owner'

const route = useRoute()
const router = useRouter()
const pets = useOwnerPetsStore()
const showDelete = ref(false)

const isCreate = computed(() => route.path === '/owner/pets/new')
const petId = computed(() => Number(route.params.id))
const pet = computed(() => (isCreate.value ? undefined : pets.getById(petId.value)))

function save(payload: Omit<OwnerPet, 'id'>) {
  if (isCreate.value) {
    pets.createPet(payload)
  } else {
    pets.updatePet(petId.value, payload)
  }
  void router.push('/owner/pets')
}

function confirmDelete() {
  pets.deletePet(petId.value)
  showDelete.value = false
  void router.push('/owner/pets')
}
</script>

<template>
  <OwnerPageShell title="Your Pet">
    <template #nav>
      <Navbar />
    </template>

    <p v-if="!isCreate && !pet" class="text-primary-500">This pet was not found.</p>
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
