<script setup lang="ts">
import L from 'leaflet'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ListedSitter } from '../../services/sitterApproval'

const props = defineProps<{
  sitters: ListedSitter[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [sitter: ListedSitter]
}>()

const mapElement = ref<HTMLElement | null>(null)
const markers = new Map<string, L.Marker>()
let map: L.Map | null = null
let markerLayer: L.LayerGroup | null = null

const bangkok: L.LatLngExpression = [13.7563, 100.5018]

function markerIcon(selected: boolean) {
  return L.divIcon({
    className: 'sitter-marker-shell',
    html: `<div class="sitter-marker ${selected ? 'is-selected' : ''}"><img src="/icon/paw.svg" alt="" /></div>`,
    iconSize: selected ? [46, 54] : [38, 46],
    iconAnchor: selected ? [23, 50] : [19, 42],
  })
}

function renderMarkers() {
  if (!map || !markerLayer) return
  markerLayer.clearLayers()
  markers.clear()
  const points: L.LatLng[] = []

  props.sitters.forEach(sitter => {
    if (sitter.latitude === null || sitter.longitude === null) return
    const position = L.latLng(sitter.latitude, sitter.longitude)
    const marker = L.marker(position, {
      icon: markerIcon(sitter.userId === props.selectedId),
      keyboard: true,
      title: sitter.displayName,
    }).addTo(markerLayer!)
    marker.on('click', () => emit('select', sitter))
    markers.set(sitter.userId, marker)
    points.push(position)
  })

  if (!points.length) {
    map.setView(bangkok, 12)
  } else if (points.length === 1) {
    map.setView(points[0]!, 13)
  } else {
    map.fitBounds(L.latLngBounds(points).pad(0.16), { maxZoom: 13 })
  }
}

function updateSelection(selectedId: string | null) {
  markers.forEach((marker, userId) => marker.setIcon(markerIcon(userId === selectedId)))
  if (!selectedId || !map) return
  const selected = markers.get(selectedId)
  if (selected) map.panTo(selected.getLatLng(), { animate: true })
}

onMounted(async () => {
  if (!mapElement.value) return
  map = L.map(mapElement.value, { zoomControl: true, attributionControl: true }).setView(bangkok, 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)
  await nextTick()
  map.invalidateSize()
  renderMarkers()
})

watch(() => props.sitters, renderMarkers, { deep: true })
watch(() => props.selectedId, updateSelection)

onBeforeUnmount(() => {
  map?.remove()
  map = null
  markerLayer = null
  markers.clear()
})
</script>

<template>
  <div ref="mapElement" class="sitter-map" aria-label="Pet sitter locations"></div>
</template>

<style>
.sitter-map {
  width: 100%;
  height: 590px;
  background: #edf3ef;
}

.sitter-marker-shell { background: transparent; border: 0; }

.sitter-marker {
  position: relative;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 50% 50% 50% 12px;
  background: #fff;
  box-shadow: 0 7px 20px rgb(38 42 54 / 22%);
  transform: rotate(-45deg);
  transition: transform 150ms ease, background 150ms ease;
}

.sitter-marker::after {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: #fff1eb;
}

.sitter-marker img {
  position: relative;
  z-index: 1;
  width: 16px;
  height: 16px;
  transform: rotate(45deg);
  filter: invert(48%) sepia(97%) saturate(2761%) hue-rotate(344deg) brightness(103%) contrast(101%);
}

.sitter-marker.is-selected {
  width: 46px;
  height: 46px;
  background: #ff6525;
  transform: rotate(-45deg) scale(1.05);
}

.sitter-marker.is-selected::after { background: #ff6525; }
.sitter-marker.is-selected img { filter: brightness(0) invert(1); }

@media (max-width: 760px) {
  .sitter-map { height: 470px; }
}
</style>
