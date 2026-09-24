import { ref } from 'vue'
import { defineStore } from 'pinia'
import { createOwnerPet, deleteOwnerPet, getOwnerPet, listOwnerPets, updateOwnerPet } from '../services/ownerApi'
import type { OwnerPet } from '../types/owner'

const defaultMockPets: OwnerPet[] = [
  {
    id: 1,
    name: 'Bubba',
    petType: 'Dog',
    breed: 'Pit Bull',
    sex: 'Male',
    ageMonths: 24,
    color: 'Grey',
    weightKg: 22,
    about: 'Friendly and energetic',
    avatarUrl: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    name: 'Daisy',
    petType: 'Dog',
    breed: 'Beagle',
    sex: 'Female',
    ageMonths: 1,
    color: 'White, black and brown',
    weightKg: 2,
    about: 'Sweet little puppy',
    avatarUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    name: 'I Som',
    petType: 'Cat',
    breed: 'Tabby',
    sex: 'Female',
    ageMonths: 18,
    color: 'Orange',
    weightKg: 4,
    about: 'Loves sleeping in sunny spots',
    avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
  },
]

export const useOwnerPetsStore = defineStore('ownerPets', () => {
  const pets = ref<OwnerPet[]>([...defaultMockPets])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const result = await listOwnerPets() as OwnerPet[]
      if (result && result.length) {
        pets.value = result
      }
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not load pets'
    } finally {
      loading.value = false
    }
  }

  async function getById(id: number) {
    const cached = pets.value.find(pet => pet.id === id)
    if (cached) return cached
    try {
      return await getOwnerPet(id) as OwnerPet
    } catch {
      return cached
    }
  }

  async function createPet(input: Omit<OwnerPet, 'id'>) {
    try {
      const created = await createOwnerPet(input) as OwnerPet
      pets.value.unshift(created)
      return created.id
    } catch {
      const newId = (pets.value.length ? Math.max(...pets.value.map(p => p.id)) : 0) + 1
      const created = { id: newId, ...input }
      pets.value.unshift(created)
      return newId
    }
  }

  async function updatePet(id: number, input: Omit<OwnerPet, 'id'>) {
    try {
      const updated = await updateOwnerPet(id, input) as OwnerPet
      pets.value = pets.value.map(pet => (pet.id === id ? updated : pet))
      return true
    } catch {
      const existing = pets.value.find(p => p.id === id)
      if (existing) {
        Object.assign(existing, input)
        return true
      }
      return false
    }
  }

  async function removePet(id: number) {
    try {
      await deleteOwnerPet(id)
    } catch {
      // Local fallback
    }
    pets.value = pets.value.filter(pet => pet.id !== id)
  }

  return { pets, loading, error, load, getById, createPet, updatePet, removePet }
})
