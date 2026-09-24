<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  address: string
  district: string
  subDistrict: string
  province: string
  postCode: string
  latitude?: number | null
  longitude?: number | null
}>()
const emit = defineEmits<{ coordinates: [latitude: number | null, longitude: number | null] }>()

const mapEl = ref<HTMLElement | null>(null)
const lat = ref(13.7563)
const lon = ref(100.5018)
const lookupError = ref('')
let map: L.Map | undefined
let marker: L.Marker | undefined
let timer: ReturnType<typeof setTimeout> | undefined

const pin = L.icon({
  iconUrl: '/image/Map_Pin_Selected.svg',
  iconSize: [44, 44],
  iconAnchor: [22, 42],
  popupAnchor: [0, -36],
})

const query = computed(() =>
  [props.address, props.subDistrict, props.district, props.province, props.postCode, 'Thailand']
    .filter(Boolean)
    .join(', '),
)

function movePin() {
  if (!map || !marker) return
  const pos: L.LatLngExpression = [lat.value, lon.value]
  marker.setLatLng(pos)
  map.setView(pos, 15)
}

async function lookup() {
  const q = query.value
  if (q.replace(/, Thailand$/, '').trim().length < 3) return
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`)
    const data = await res.json() as { lat: string; lon: string }[]
    if (!data[0]) {
      lookupError.value = 'Could not find this address on the map. Please check the address.'
      emit('coordinates', null, null)
      return
    }
    lat.value = Number(data[0].lat)
    lon.value = Number(data[0].lon)
    lookupError.value = ''
    emit('coordinates', lat.value, lon.value)
    movePin()
  } catch {
    lookupError.value = 'Map lookup is unavailable. The address can still be edited.'
    emit('coordinates', null, null)
  }
}

watch(query, () => {
  clearTimeout(timer)
  emit('coordinates', null, null)
  timer = setTimeout(lookup, 700)
})

onMounted(async () => {
  if (!mapEl.value) return
  if (props.latitude != null && props.longitude != null) {
    lat.value = props.latitude
    lon.value = props.longitude
  }
  map = L.map(mapEl.value).setView([lat.value, lon.value], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)
  marker = L.marker([lat.value, lon.value], { icon: pin }).addTo(map)
  await nextTick()
  map.invalidateSize()
  window.setTimeout(() => map?.invalidateSize(), 300)
  if (props.latitude == null && query.value.replace(/, Thailand$/, '').trim().length >= 3) void lookup()
})

onUnmounted(() => {
  clearTimeout(timer)
  map?.remove()
  map = undefined
  marker = undefined
})
</script>

<template>
  <figure class="address-map">
    <div ref="mapEl" class="map-canvas" role="img" aria-label="Address map preview"></div>
    <figcaption v-if="lookupError" role="status">{{ lookupError }}</figcaption>
    <figcaption v-else>Map location will be included with your profile when the address is found.</figcaption>
  </figure>
</template>

<style scoped>
.address-map { margin: 22px 0 0; }
.map-canvas { width: 100%; height: 280px; border: 1px solid #cdd5e5; border-radius: 8px; overflow: hidden; background: #f2f5f8; }
.address-map figcaption { margin-top: 8px; color: #777f90; font-size: 13px; }
</style>
