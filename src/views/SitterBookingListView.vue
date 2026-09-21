<script setup lang="ts">
import BookingListTable from '../components/sitter/BookingListTable.vue'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
</script>

<template>
  <SitterPageShell>
    <main class="px-6 py-8 sm:px-8">
      <BookingListTable />
    </main>
  </SitterPageShell>
</template>
