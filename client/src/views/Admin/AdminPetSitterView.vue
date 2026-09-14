<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-[#f7f7fa]">
    <AdminSidebar active-path="/admin/owners" />

    <main class="min-w-0 flex-1 px-8 py-8 text-[#30343f]">
      <header class="border-b border-[#e5e5eb] pb-6">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b8c98]">Admin Panel</p>
        <h1 class="mt-2 text-3xl font-bold">Pet Owners</h1>
        <p class="mt-2 text-sm text-[#777c8c]">Manage registered pet owners from your dashboard.</p>
      </header>

      <section class="mt-8 rounded-lg border border-[#e5e5eb] bg-white p-6" aria-labelledby="owners-heading">
        <h2 id="owners-heading" class="text-lg font-semibold">Owner list</h2>
        <p class="mt-2 text-sm text-[#777c8c]">Owner records will appear here when the admin API is connected.</p>
      </section>
    </main>
  </div>
</template>