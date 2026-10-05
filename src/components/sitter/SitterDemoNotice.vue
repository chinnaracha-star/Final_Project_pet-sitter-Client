<script setup lang="ts">
import { isSitterDemo, resetSitterDemo, setSitterDemo } from '../../services/sitterDemo'

defineProps<{ alwaysDemo?: boolean }>()
const demo = isSitterDemo()
</script>

<template>
  <div class="demo-notice" role="status">
    <span v-if="alwaysDemo"><b>Demo data</b> · Messages are local to this browser session.</span>
    <span v-else-if="demo"><b>Demo data</b> · Changes are saved only in this browser.</span>
    <span v-else>Server data · You can switch to demo data while integration is pending.</span>
    <span v-if="!alwaysDemo" class="actions">
      <button v-if="demo" type="button" @click="resetSitterDemo">Reset demo</button>
      <button type="button" @click="setSitterDemo(!demo)">{{ demo ? 'Exit demo' : 'Use demo data' }}</button>
    </span>
  </div>
</template>

<style scoped>
.demo-notice { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; padding: 10px 14px; border: 1px solid #ffdfc9; border-radius: 8px; background: #fff2ec; color: #565a6c; font-size: 13px; }
.demo-notice b { color: #e2480a; }
.demo-notice button { border: 0; background: transparent; color: #e2480a; font-weight: 700; text-decoration: underline; }
.actions { display: inline-flex; gap: 12px; }
</style>
