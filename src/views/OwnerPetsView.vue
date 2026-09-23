<script setup lang="ts">
import { onMounted } from 'vue'
import { Navbar } from '../components'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import { useOwnerPetsStore } from '../stores/ownerPets'
import type { PetTypeName } from '../types/owner'

const pets = useOwnerPetsStore()
onMounted(() => {
  void pets.load()
})

const typeBadge: Record<PetTypeName, string> = {
  Dog: 'bg-green-100 text-green-500',
  Cat: 'bg-pink-100 text-pink-500',
  Bird: 'bg-blue-100 text-blue-500',
  Rabbit: 'bg-yellow-100 text-yellow-500',
}
</script>

<template>
  <OwnerPageShell title="Your Pet">
    <template #nav>
      <Navbar />
    </template>
    <template #actions>
      <RouterLink to="/owner/pets/new" class="auth-submit inline-flex items-center px-6 no-underline whitespace-nowrap">
        Create Pet
      </RouterLink>
    </template>

    <p v-if="pets.error" class="mb-6 auth-notice" role="alert">{{ pets.error }}</p>
    <p v-else-if="pets.loading" class="mb-6 text-primary-500">Loading pets...</p>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      <RouterLink
        v-for="pet in pets.pets"
        :key="pet.id"
        :to="`/owner/pets/${pet.id}`"
        class="flex flex-col items-center rounded-2xl border border-primary-100 px-4 py-6 no-underline"
      >
        <img
          v-if="pet.avatarUrl"
          :src="pet.avatarUrl"
          :alt="pet.name"
          class="size-28 rounded-full object-cover"
        />
        <div v-else class="grid size-28 place-items-center rounded-full bg-primary-100 text-sm text-primary-300">No photo</div>
        <h2 class="mt-4 text-center text-base font-bold text-primary-900">{{ pet.name }}</h2>
        <span class="mt-2 rounded-full px-3 py-0.5 text-sm font-medium" :class="typeBadge[pet.petType]">
          {{ pet.petType }}
        </span>
      </RouterLink>
    </div>
  </OwnerPageShell>
</template>
