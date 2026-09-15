<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

type GalleryImage = { name: string; url: string }

const images = ref<GalleryImage[]>([])
const imageError = ref('')

function addImages(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files ?? [])
  if (images.value.length + selected.length > 10) {
    imageError.value = 'Uploadได้สูงสุด 10 รูป'
    input.value = ''
    return
  }
  imageError.value = ''
  images.value.push(...selected.map(file => ({ name: file.name, url: URL.createObjectURL(file) })))
  input.value = ''
}

function removeImage(index: number) {
  const removed = images.value.splice(index, 1)[0]
  if (removed) URL.revokeObjectURL(removed.url)
  imageError.value = ''
}

onUnmounted(() => {
  images.value.forEach(image => URL.revokeObjectURL(image.url))
})
</script>

<template>
  <div class="field wide">
    <label>Image Gallery (Maximum 10 images)</label>
    <div class="gallery">
      <div v-for="(image, index) in images" :key="image.url" class="gallery-image">
        <img :src="image.url" :alt="image.name" />
        <button type="button" :aria-label="`Remove ${image.name}`" @click="removeImage(index)">×</button>
      </div>
      <label class="upload-tile">
        <span class="upload-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
            <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </span>
        <span class="upload-text">Upload Image</span>
        <input type="file" accept="image/*" multiple class="visually-hidden" @change="addImages" />
      </label>
    </div>
    <small v-if="imageError" class="error" role="alert">{{ imageError }}</small>
  </div>
</template>

<style scoped>
.field { min-width: 0; display: flex; flex-direction: column; gap: 9px; }
.field.wide { grid-column: 1 / -1; }
.field > label { color: #222; font-size: 15px; font-weight: 600; }
.gallery { display: flex; gap: 12px; flex-wrap: wrap; }
.gallery-image,
.upload-tile { position: relative; width: 148px; height: 148px; border-radius: 16px; }
.gallery-image { overflow: hidden; }
.gallery-image img { width: 100%; height: 100%; object-fit: cover; }
.gallery-image button { position: absolute; right: 8px; top: 8px; width: 23px; height: 23px; border: 0; border-radius: 50%; background: #444b60; color: white; }
.upload-tile { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #ff7037; background: #fff1ec; cursor: pointer; }
.upload-icon { display: grid; width: 40px; height: 40px; }
.upload-icon svg { width: 100%; height: 100%; }
.upload-text { font-size: 14px; font-weight: 500; }
.error { color: #d43a3a; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 760px) {
  .field.wide { grid-column: 1; }
}
</style>
