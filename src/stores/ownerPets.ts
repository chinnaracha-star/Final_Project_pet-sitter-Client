import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { OwnerPet } from '../types/owner'

export const useOwnerPetsStore = defineStore('ownerPets', () => {
  const pets = ref<OwnerPet[]>([
    {
      id: 1,
      name: 'Bubba',
      petType: 'Dog',
      breed: 'Pit Bull',
      sex: 'Male',
      ageMonths: 24,
      color: 'Grey',
      weightKg: 22,
      about: '',
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
      about: '',
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
      about: '',
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 4,
      name: 'Noodle Birb',
      petType: 'Bird',
      breed: 'Parakeet',
      sex: 'Male',
      ageMonths: 12,
      color: 'Green',
      weightKg: 0.1,
      about: '',
      avatarUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=400&q=80',
    },
  ])

  function getById(id: number) {
    return pets.value.find(pet => pet.id === id)
  }

  function createPet(input: Omit<OwnerPet, 'id'>) {
    const id = Math.max(0, ...pets.value.map(pet => pet.id)) + 1
    pets.value.push({ id, ...input })
    return id
  }

  function updatePet(id: number, input: Omit<OwnerPet, 'id'>) {
    const pet = getById(id)
    if (!pet) return false
    Object.assign(pet, input)
    return true
  }

  function deletePet(id: number) {
    pets.value = pets.value.filter(pet => pet.id !== id)
  }

  return { pets, getById, createPet, updatePet, deletePet }
})
