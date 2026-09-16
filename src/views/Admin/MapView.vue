<script setup lang="ts">
import MapComponent from '../../components/admin/Map.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header class="border-b border-slate-200 bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Location Map</h1>
            <p class="mt-1 text-sm text-slate-500">Vue + Leaflet + Spring Boot</p>
          </div>
          <div class="rounded-lg bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600">Map</div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <MapComponent />
      </div>
    </main>
  </div>
</template>
