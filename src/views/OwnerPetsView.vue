<script setup lang="ts">
import { Navbar } from '../components'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import { useOwnerPetsStore } from '../stores/ownerPets'

const pets = useOwnerPetsStore()
</script>

<template>
  <OwnerPageShell title="Your Pet">
    <template #nav>
      <Navbar />
    </template>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="pet in pets.pets"
        :key="pet.id"
        :to="`/owner/pets/${pet.id}`"
        class="overflow-hidden rounded-2xl bg-white shadow-sm no-underline"
      >
        <img :src="pet.avatarUrl" :alt="pet.name" class="h-56 w-full object-cover" />
        <div class="p-4">
          <h2 class="text-lg font-bold text-primary-900">{{ pet.name }}</h2>
          <p class="text-sm text-primary-500">{{ pet.petType }} ({{ pet.ageMonths }} Month)</p>
        </div>
      </RouterLink>

      <RouterLink
        to="/owner/pets/new"
        class="grid min-h-[280px] place-items-center rounded-2xl border-2 border-dashed border-primary-100 text-primary-300 no-underline"
      >
        <span class="text-center text-4xl font-light">+<br /><span class="text-base">Create Pet</span></span>
      </RouterLink>
    </div>
  </OwnerPageShell>
</template>
