<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { placeFromNominatim, type MapAddress } from './mapAddress'

const props = defineProps<{
  address: string
  district: string
  subDistrict: string
  province: string
  postCode: string
  latitude?: number | null
  longitude?: number | null
  readonly?: boolean
}>()
const emit = defineEmits<{
  coordinates: [latitude: number | null, longitude: number | null]
  place: [place: MapAddress & { latitude: number; longitude: number }]
}>()

const mapEl = ref<HTMLElement | null>(null)
const lat = ref(13.7563)
const lon = ref(100.5018)
const lookupError = ref('')
const tileError = ref(false)
let map: L.Map | undefined
let tiles: L.TileLayer | undefined
let resizeObserver: ResizeObserver | undefined
let marker: L.Marker | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let lookupId = 0
let ignoreQuery = false

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

function selectLocation(position: L.LatLng) {
  if (props.readonly) return
  lookupId++
  clearTimeout(timer)
  lat.value = position.lat
  lon.value = position.lng
  lookupError.value = ''
  emit('coordinates', lat.value, lon.value)
  movePin()
  void reverseGeocode(position)
}

async function reverseGeocode(position: L.LatLng) {
  const currentLookup = lookupId
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${position.lat}&lon=${position.lng}`,
      { headers: { 'Accept-Language': 'th' } },
    )
    if (currentLookup !== lookupId) return
    if (!res.ok) throw new Error('lookup failed')
    const data = await res.json() as { address?: Record<string, string> }
    if (currentLookup !== lookupId) return
    ignoreQuery = true
    emit('place', { ...placeFromNominatim(data.address), latitude: position.lat, longitude: position.lng })
    await nextTick()
    ignoreQuery = false
  } catch {
    if (currentLookup !== lookupId) return
    lookupError.value = 'Could not read this location. The pin is saved, and you can type the address.'
  }
}

async function lookup() {
  const q = query.value
  if (q.replace(/, Thailand$/, '').trim().length < 3) return
  const currentLookup = ++lookupId
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`)
    if (!res.ok) throw new Error('lookup failed')
    const data = await res.json() as { lat: string; lon: string }[]
    if (currentLookup !== lookupId) return
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
    if (currentLookup !== lookupId) return
    lookupError.value = 'Map lookup is unavailable. The address can still be edited.'
    emit('coordinates', null, null)
  }
}

watch([query, () => props.latitude, () => props.longitude], ([q, nextLat, nextLon], [oldQuery, oldLat, oldLon]) => {
  if (ignoreQuery) return
  if (nextLat != null && nextLon != null && (nextLat !== oldLat || nextLon !== oldLon)) {
    clearTimeout(timer)
    if (nextLat !== lat.value || nextLon !== lon.value) lookupId++
    lat.value = nextLat
    lon.value = nextLon
    movePin()
    return
  }
  if (q === oldQuery) return
  clearTimeout(timer)
  lookupId++
  emit('coordinates', null, null)
  timer = setTimeout(lookup, 700)
}, { flush: 'post' })

watch(() => props.readonly, readonly => {
  if (readonly) marker?.dragging?.disable()
  else marker?.dragging?.enable()
})

function retryTiles() {
  tileError.value = false
  tiles?.redraw()
}

onMounted(async () => {
  if (!mapEl.value) return
  if (props.latitude != null && props.longitude != null) {
    lat.value = props.latitude
    lon.value = props.longitude
  }
  map = L.map(mapEl.value).setView([lat.value, lon.value], 13)
  tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).on('tileerror', () => { tileError.value = true }).addTo(map)
  marker = L.marker([lat.value, lon.value], { icon: pin, draggable: !props.readonly })
    .on('dragend', event => selectLocation((event.target as L.Marker).getLatLng()))
    .addTo(map)
  map.on('click', event => selectLocation(event.latlng))
  await nextTick()
  map.invalidateSize()
  resizeObserver = new ResizeObserver(() => map?.invalidateSize())
  resizeObserver.observe(mapEl.value)
  if (props.latitude == null && query.value.replace(/, Thailand$/, '').trim().length >= 3) void lookup()
})

onUnmounted(() => {
  clearTimeout(timer)
  lookupId++
  resizeObserver?.disconnect()
  map?.remove()
  map = undefined
  marker = undefined
})
</script>

<template>
  <figure class="address-map">
    <div ref="mapEl" class="map-canvas" role="img" aria-label="Address map preview"></div>
    <figcaption v-if="tileError" role="status">
      โหลดภาพแผนที่บางส่วนไม่สำเร็จ ตำแหน่งหมุดยังใช้งานได้
      <button type="button" @click="retryTiles">โหลดแผนที่ใหม่</button>
    </figcaption>
    <figcaption v-if="lookupError" role="status">{{ lookupError }}</figcaption>
    <figcaption v-else>Click the map or drag the pin to choose the exact location saved with your profile.</figcaption>
  </figure>
</template>

<style scoped>
.address-map { margin: 22px 0 0; }
.map-canvas { width: 100%; height: 280px; border: 1px solid #cdd5e5; border-radius: 8px; overflow: hidden; background: #f2f5f8; }
.address-map figcaption { margin-top: 8px; color: #777f90; font-size: 13px; }
</style>
