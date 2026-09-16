<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import L from 'leaflet'

interface Location {
  id?: number
  name: string
  latitude: number
  longitude: number
}

const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null
const markers: L.Marker[] = []
const API_URL = '/api/locations'

function createCustomIcon() {
  return L.divIcon({
    className: '',
    html: '<div class="map-pin"><div class="map-pin-center"></div></div>',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  })
}

function popupContent(location: Location) {
  return `<div><strong>${location.name}</strong><br>Latitude: ${location.latitude}<br>Longitude: ${location.longitude}</div>`
}

async function loadLocations() {
  if (!map) return
  const currentMap = map
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Failed to load locations')
    const locations = await response.json() as Location[]
    const icon = createCustomIcon()
    locations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude], { icon })
        .addTo(currentMap)
        .bindPopup(popupContent(location))
      markers.push(marker)
    })
  } catch (error) {
    console.error('Could not load locations:', error)
  }
}

async function saveLocation(latitude: number, longitude: number) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Selected Location', latitude, longitude }),
  })
  if (!response.ok) throw new Error('Failed to save location')
}

async function handleMapClick(event: L.LeafletMouseEvent) {
  if (!map) return
  const { lat, lng } = event.latlng
  const location: Location = {
    name: 'Selected Location',
    latitude: lat,
    longitude: lng,
  }
  const marker = L.marker([lat, lng], { icon: createCustomIcon() })
    .addTo(map)
    .bindPopup(popupContent(location))
    .openPopup()
  markers.push(marker)
  try {
    await saveLocation(lat, lng)
  } catch (error) {
    console.error('Could not save location:', error)
  }
}

onMounted(async () => {
  if (!mapElement.value) return
  map = L.map(mapElement.value).setView([13.7563, 100.5018], 12)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
  await loadLocations()
  map.on('click', handleMapClick)
})

onBeforeUnmount(() => {
  if (!map) return
  map.off('click', handleMapClick)
  map.remove()
  map = null
})
</script>

<template>
  <div class="relative">
    <div ref="mapElement" class="h-[600px] w-full"></div>
    <div class="absolute left-4 top-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
      <div class="text-sm font-semibold text-slate-900">Location Map</div>
      <div class="mt-1 text-xs text-slate-500">Click anywhere on the map to add a location.</div>
    </div>
  </div>
</template>

<style scoped>
:deep(.map-pin) {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  transform: rotate(-45deg);
  border-radius: 50% 50% 50% 0;
  background: #f97316;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2);
}

:deep(.map-pin-center) {
  width: 24px;
  height: 24px;
  transform: rotate(45deg);
  border-radius: 50%;
  background: white;
}
</style>
