<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
	latitude: number | null
	longitude: number | null
}>()

const mapEl = ref<HTMLElement | null>(null)
let map: L.Map | undefined
let marker: L.Marker | undefined

const pin = L.icon({
	iconUrl: '/image/Map_Pin_Selected.svg',
	iconSize: [36, 36],
	iconAnchor: [18, 36],
	popupAnchor: [0, -32],
})

function handleWheel(e: WheelEvent) {
	if (!map) return
	if (e.ctrlKey) {
		e.preventDefault()
		map.scrollWheelZoom.enable()
	} else {
		map.scrollWheelZoom.disable()
	}
}

function renderMap() {
	if (!mapEl.value || props.latitude == null || props.longitude == null) return
	const pos: L.LatLngExpression = [props.latitude, props.longitude]
	if (!map) {
		map = L.map(mapEl.value, {
			zoomControl: false,
			dragging: false,
			scrollWheelZoom: false,
			doubleClickZoom: false,
			touchZoom: false,
		}).setView(pos, 15)
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors',
		}).addTo(map)
		marker = L.marker(pos, { icon: pin }).addTo(map)
		// only zoom on wheel when Ctrl is held, otherwise let the page scroll normally
		map.getContainer().addEventListener('wheel', handleWheel, { passive: false })
	} else {
		map.setView(pos, 15)
		marker?.setLatLng(pos)
	}
	map.invalidateSize()
}

onMounted(renderMap)

watch(() => [props.latitude, props.longitude], renderMap)

onBeforeUnmount(() => {
	map?.getContainer().removeEventListener('wheel', handleWheel)
	map?.remove()
	map = undefined
	marker = undefined
})
</script>

<template>
	<div class="relative h-52 overflow-hidden rounded-md bg-[#e5e9e9]">
		<div ref="mapEl" class="h-full w-full"></div>
		<div v-if="latitude == null || longitude == null" class="absolute inset-0 flex items-center justify-center text-[10px] text-[#9297a9]">
			No location provided.
		</div>
	</div>
</template>
