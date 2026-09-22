import { ref } from 'vue'
import { defineStore } from 'pinia'
import { createOwnerPet, deleteOwnerPet, getOwnerPet, listOwnerPets, updateOwnerPet } from '../services/ownerApi'
import type { OwnerPet } from '../types/owner'

export const useOwnerPetsStore = defineStore('ownerPets', () => {
  const pets = ref<OwnerPet[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      pets.value = await listOwnerPets() as OwnerPet[]
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not load pets'
    } finally {
      loading.value = false
    }
  }

  async function getById(id: number) {
    const cached = pets.value.find(pet => pet.id === id)
    if (cached) return cached
    return getOwnerPet(id) as Promise<OwnerPet>
  }

  async function createPet(input: Omit<OwnerPet, 'id'>) {
    const created = await createOwnerPet(input) as OwnerPet
    pets.value.unshift(created)
    return created.id
  }

  async function updatePet(id: number, input: Omit<OwnerPet, 'id'>) {
    const updated = await updateOwnerPet(id, input) as OwnerPet
    pets.value = pets.value.map(pet => (pet.id === id ? updated : pet))
    return true
  }

  async function removePet(id: number) {
    await deleteOwnerPet(id)
    pets.value = pets.value.filter(pet => pet.id !== id)
  }

  return { pets, loading, error, load, getById, createPet, updatePet, removePet }
})
