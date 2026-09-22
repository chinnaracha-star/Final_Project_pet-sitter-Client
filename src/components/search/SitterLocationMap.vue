<script setup lang="ts">
import L from 'leaflet'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  latitude: number
  longitude: number
  label: string
}>()

const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null

onMounted(() => {
  if (!mapElement.value) return
  const position: L.LatLngExpression = [props.latitude, props.longitude]
  map = L.map(mapElement.value, {
    zoomControl: true,
    dragging: true,
    scrollWheelZoom: false,
  }).setView(position, 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
  const icon = L.divIcon({
    className: 'profile-location-shell',
    html: '<div class="profile-location-marker"><img src="/icon/map-pin.svg" alt="" /></div>',
    iconSize: [42, 50],
    iconAnchor: [21, 46],
  })
  L.marker(position, { icon, title: props.label }).addTo(map)
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapElement" class="profile-location-map" :aria-label="`Location for ${label}`"></div>
</template>

<style>
.profile-location-map {
  width: 100%;
  height: 280px;
  border-radius: 20px;
  background: #edf3ef;
  overflow: hidden;
}

.profile-location-shell { background: transparent; border: 0; }
.profile-location-marker {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 4px solid #fff;
  border-radius: 50% 50% 50% 12px;
  background: #ff6525;
  box-shadow: 0 7px 20px rgb(38 42 54 / 24%);
  transform: rotate(-45deg);
}
.profile-location-marker img {
  width: 18px;
  height: 18px;
  transform: rotate(45deg);
  filter: brightness(0) invert(1);
}
</style>
