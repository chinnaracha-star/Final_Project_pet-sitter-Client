<script setup lang="ts">
const props = defineProps<{
  count: number
  showNumber?: boolean
  showEmpty?: boolean
}>()

function fillPercent(position: number) {
  return Math.max(0, Math.min(100, (props.count - position + 1) * 100))
}
</script>

<template>
  <div class="star-rating">
    <span v-if="showNumber" class="star-number">
      {{ count }}
    </span>
    <div class="star-list">
      <span v-for="i in (showEmpty ? 5 : Math.ceil(count))" :key="i" class="star-slot">
        <svg class="star-base" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
        </svg>
        <span class="star-fill" :style="{ width: `${fillPercent(i)}%` }">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
          </svg>
        </span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.star-rating { --star-size: 14px; --star-gap: 2px; display: inline-flex; align-items: center; gap: 4px; }
.star-number { margin-right: 2px; color: #374151; font-size: 14px; font-weight: 600; }
.star-list { display: inline-flex; align-items: center; gap: var(--star-gap); }
.star-slot { position: relative; width: var(--star-size); height: var(--star-size); flex: 0 0 var(--star-size); }
.star-slot svg { width: var(--star-size); height: var(--star-size); }
.star-base { fill: #e2e5e9; }
.star-fill { position: absolute; inset: 0 auto 0 0; overflow: hidden; color: #1ccd83; }
.star-fill svg { max-width: none; fill: currentColor; }
</style>
