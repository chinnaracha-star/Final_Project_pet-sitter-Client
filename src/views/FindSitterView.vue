<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getListedSitters, type ListedSitter } from '../services/sitterApproval'

const sitters = ref<ListedSitter[]>([])
const notice = ref('')

onMounted(async () => {
  try {
    const response = await getListedSitters()
    sitters.value = response.sitters
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูล Pet Sitter ได้'
  }
})
</script>

<template>
  <main class="mx-auto min-h-screen w-[min(100%-32px,1120px)] py-12">
    <h1 class="text-3xl font-bold">Find Pet Sitter</h1>
    <p class="mt-2 text-primary-500">Only approved and listed sitters appear here.</p>
    <p v-if="notice" class="mt-6 rounded-lg bg-orange-100 p-4 text-orange-900" role="status">{{ notice }}</p>
    <p v-else-if="sitters.length === 0" class="mt-8 rounded-xl bg-white p-6">No pet sitters are available.</p>
    <section class="mt-8 grid gap-5 md:grid-cols-2">
      <article v-for="sitter in sitters" :key="sitter.userId" class="rounded-xl bg-white p-6 shadow-sm">
        <img v-if="sitter.avatarUrl" :src="sitter.avatarUrl" class="size-20 rounded-full object-cover" alt="" />
        <h2 class="mt-4 text-xl font-bold">{{ sitter.displayName }}</h2>
        <p class="mt-1 text-primary-500">{{ sitter.petTypes.join(', ') }}</p>
        <p class="mt-3">{{ sitter.services }}</p>
        <p class="mt-3 text-sm text-primary-500">{{ sitter.province }}</p>
      </article>
    </section>
  </main>
</template>
