<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Footer, Navbar } from '../components'
import StarRating from '../components/common/StarRating.vue'
import SitterMap from '../components/search/SitterMap.vue'
import {
  getListedSitters,
  getMapSitters,
  type ListedSitter,
  type ListedSitterSearchParams,
} from '../services/sitterApproval'

type ViewMode = 'list' | 'map'

const petTypeOptions = ['Dog', 'Cat', 'Bird', 'Rabbit']
const experienceOptions = ['0-2 Years', '3-5 Years', '5+ Years']
const ratingOptions = [5, 4, 3, 2, 1]
const ratingRows = [ratingOptions.slice(0, 2), ratingOptions.slice(2)]
const pageSize = 5
const fallbackAvatarImages = [
  '/image/content1.png',
  '/image/content3.png',
  '/navbar/profile.png',
]
const route = useRoute()
const router = useRouter()

const sitters = ref<ListedSitter[]>([])
const mapSitters = ref<ListedSitter[]>([])
const loading = ref(true)
const notice = ref('')
const currentPage = ref(1)
const totalPages = ref(0)
const totalItems = ref(0)
const viewMode = ref<ViewMode>('list')
const selectedId = ref<string | null>(null)
const mapCardTrack = ref<HTMLElement | null>(null)
const draggingCards = ref(false)
let cardDrag: { pointerId: number; startX: number; scrollLeft: number } | null = null
let suppressCardClick = false
let cardAnimation = 0
let targetScroll = 0
let dragVelocity = 0
let lastDragX = 0
let lastDragTime = 0
let coastingCards = false

function stopCardAnimation() {
  cancelAnimationFrame(cardAnimation)
  cardAnimation = 0
  coastingCards = false
}

function coastCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  let previousTime = performance.now()
  coastingCards = true
  function frame(time: number) {
    const track = mapCardTrack.value
    if (!track || Math.abs(dragVelocity) < 0.02) {
      stopCardAnimation()
      return
    }
    const elapsed = Math.min(time - previousTime, 32)
    previousTime = time
    const before = track.scrollLeft
    const decay = Math.exp(-elapsed / 240)
    track.scrollLeft += dragVelocity * 240 * (1 - decay)
    dragVelocity *= decay
    if (Math.abs(track.scrollLeft - before) < 0.1) {
      stopCardAnimation()
      return
    }
    cardAnimation = requestAnimationFrame(frame)
  }
  cardAnimation = requestAnimationFrame(frame)
}

onBeforeUnmount(stopCardAnimation)
watch(mapCardTrack, () => {
  stopCardAnimation()
  cardDrag = null
  draggingCards.value = false
})

function startCardDrag(event: PointerEvent) {
  stopCardAnimation()
  suppressCardClick = false
  if (event.pointerType !== 'mouse' || event.button !== 0 || !mapCardTrack.value) return
  cardDrag = { pointerId: event.pointerId, startX: event.clientX, scrollLeft: mapCardTrack.value.scrollLeft }
  dragVelocity = 0
  lastDragX = event.clientX
  lastDragTime = performance.now()
}

function moveCardDrag(event: PointerEvent) {
  const track = mapCardTrack.value
  if (!track || !cardDrag || event.pointerId !== cardDrag.pointerId) return
  const distance = event.clientX - cardDrag.startX
  if (!draggingCards.value && Math.abs(distance) < 6) return
  if (!draggingCards.value) {
    draggingCards.value = true
    suppressCardClick = true
    track.setPointerCapture(event.pointerId)
  }
  event.preventDefault()
  const now = performance.now()
  const elapsed = Math.max(now - lastDragTime, 1)
  const velocity = (lastDragX - event.clientX) / elapsed
  dragVelocity = elapsed > 80 ? velocity : dragVelocity * 0.35 + velocity * 0.65
  dragVelocity = Math.max(-3, Math.min(3, dragVelocity))
  lastDragX = event.clientX
  lastDragTime = now
  targetScroll = cardDrag.scrollLeft - distance
  if (!cardAnimation) cardAnimation = requestAnimationFrame(() => {
    track.scrollLeft = targetScroll
    cardAnimation = 0
  })
}

function endCardDrag(event: PointerEvent) {
  if (cardDrag?.pointerId !== event.pointerId) return
  const wasDragging = draggingCards.value
  stopCardAnimation()
  cardDrag = null
  draggingCards.value = false
  const track = mapCardTrack.value
  if (track && wasDragging) track.scrollLeft = targetScroll
  if (track?.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId)
  if (wasDragging && event.type === 'pointerup' && performance.now() - lastDragTime < 80) coastCards()
}

function guardCardClick(event: MouseEvent) {
  if (!suppressCardClick || event.detail === 0) return
  event.preventDefault()
  event.stopPropagation()
  suppressCardClick = false
}

const filters = reactive({
  keyword: '',
  petTypes: [] as string[],
  minRating: null as number | null,
  experience: '',
})

const selectedSitter = computed(() =>
  mapSitters.value.find(sitter => sitter.userId === selectedId.value) || mapSitters.value[0] || null,
)

function one(value: unknown) {
  return Array.isArray(value) ? String(value[0] || '') : typeof value === 'string' ? value : ''
}

function many(value: unknown) {
  const values = Array.isArray(value) ? value : value ? [value] : []
  return values.map(String).filter(value => petTypeOptions.includes(value))
}

function readRouteState() {
  filters.keyword = one(route.query.keyword)
  filters.petTypes = many(route.query.petType)
  const rating = Number(one(route.query.minRating))
  filters.minRating = Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null
  const experience = one(route.query.experience)
  filters.experience = experienceOptions.includes(experience) ? experience : ''
  viewMode.value = one(route.query.view) === 'map' ? 'map' : 'list'
  const page = Number(one(route.query.page))
  currentPage.value = Number.isInteger(page) && page > 0 ? page : 1
}

function queryFor(page = 1) {
  const query: Record<string, string | string[]> = { view: viewMode.value }
  if (filters.keyword.trim()) query.keyword = filters.keyword.trim()
  if (filters.petTypes.length) query.petType = [...filters.petTypes]
  if (filters.minRating !== null) query.minRating = String(filters.minRating)
  if (filters.experience) query.experience = filters.experience
  if (viewMode.value === 'list' && page > 1) query.page = String(page)
  return query
}

function searchParams(): ListedSitterSearchParams {
  return {
    keyword: filters.keyword,
    petTypes: filters.petTypes,
    minRating: filters.minRating,
    experience: filters.experience,
  }
}

async function loadResults() {
  loading.value = true
  notice.value = ''
  try {
    if (viewMode.value === 'map') {
      mapSitters.value = await getMapSitters(searchParams())
      totalItems.value = mapSitters.value.length
      if (!mapSitters.value.some(sitter => sitter.userId === selectedId.value)) {
        selectedId.value = mapSitters.value[0]?.userId || null
      }
    } else {
      const response = await getListedSitters({ ...searchParams(), page: currentPage.value, limit: pageSize })
      sitters.value = response.sitters
      currentPage.value = response.currentPage
      totalPages.value = response.totalPages
      totalItems.value = response.totalItems
    }
  } catch (error) {
    sitters.value = []
    mapSitters.value = []
    totalPages.value = 0
    totalItems.value = 0
    notice.value = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูล Pet Sitter ได้'
  } finally {
    loading.value = false
  }
}

async function updateUrl(page = 1) {
  const target = queryFor(page)
  if (JSON.stringify(target) === JSON.stringify(route.query)) {
    currentPage.value = page
    await loadResults()
    return
  }
  await router.push({ path: '/search', query: target })
}

function search() { void updateUrl(1) }

function switchView(mode: ViewMode) {
  if (viewMode.value === mode) return
  viewMode.value = mode
  selectedId.value = null
  void updateUrl(1)
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  void updateUrl(page)
}

function clearFilters() {
  filters.keyword = ''
  filters.petTypes = []
  filters.minRating = null
  filters.experience = ''
  void updateUrl(1)
}

function petTypeClass(petType: string) { return `tag-${petType.toLowerCase()}` }
function ratingStars(sitter: ListedSitter) { return Math.max(0, Math.min(5, sitter.ratingAvg)) }
function selectSitter(sitter: ListedSitter) { selectedId.value = sitter.userId }
function selectMapMarker(sitter: ListedSitter) {
  stopCardAnimation()
  selectSitter(sitter)
  const track = mapCardTrack.value
  const card = track?.querySelector<HTMLElement>(`[data-sitter-id="${sitter.userId}"]`)
  if (track && card) track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' })
}
function fallbackIndex(sitter: ListedSitter, length: number) {
  return [...sitter.userId].reduce((total, character) => total + character.charCodeAt(0), 0) % length
}
function sitterPhoto(sitter: ListedSitter) {
  if (sitter.imageUrl) return sitter.imageUrl

  const photos = sitter.petTypes.includes('Dog') && sitter.petTypes.includes('Cat')
    ? ['/image/dog2.jpg', '/image/cat.jpg', '/image/blackcat.jpg', '/image/dog1.jpg']
    : sitter.petTypes.includes('Dog')
      ? ['/image/dog2.jpg', '/image/dog1.jpg']
      : sitter.petTypes.includes('Cat')
        ? ['/image/cat.jpg', '/image/blackcat.jpg', '/image/services-cat.png']
        : sitter.petTypes.includes('Bird')
          ? ['/image/bird.jpg']
          : ['/image/cat.jpg', '/image/dog2.jpg', '/image/blackcat.jpg']

  return photos[fallbackIndex(sitter, photos.length)]
}
function sitterAvatar(sitter: ListedSitter) {
  return sitter.avatarUrl || fallbackAvatarImages[fallbackIndex(sitter, fallbackAvatarImages.length)]
}

watch(
  () => route.fullPath,
  () => {
    readRouteState()
    void loadResults()
  },
  { immediate: true },
)
</script>

<template>
  <div class="search-page">
    <Navbar />

    <main class="search-main" :class="{ 'map-view': viewMode === 'map' }">
      <div class="title-row">
        <h1>Search For Pet Sitter</h1>
        <div class="view-switch" aria-label="View mode">
          <button type="button" :class="{ active: viewMode === 'list' }" @click="switchView('list')">
            <img src="/icon/list.svg" alt="" />List
          </button>
          <button type="button" :class="{ active: viewMode === 'map' }" @click="switchView('map')">
            <img src="/icon/map.svg" alt="" />Map
          </button>
        </div>
      </div>

      <div class="search-layout">
        <aside class="filter-column">
          <form class="filter-card" @submit.prevent="search">
            <label for="search-input">Search</label>
            <div class="search-input-wrap">
              <input id="search-input" v-model="filters.keyword" type="search" />
              <img src="/icon/search.svg" alt="" />
            </div>

            <fieldset>
              <legend>Pet Type:</legend>
              <div class="pet-options">
                <label v-for="pet in petTypeOptions" :key="pet">
                  <input v-model="filters.petTypes" type="checkbox" :value="pet" />{{ pet }}
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Rating:</legend>
              <div class="rating-options">
                <div v-for="(row, rowIndex) in ratingRows" :key="rowIndex" class="rating-row">
                  <button v-for="rating in row" :key="rating" type="button" :aria-label="`${rating} stars and above`" :aria-pressed="filters.minRating === rating" :class="{ selected: filters.minRating === rating }" @click="filters.minRating = filters.minRating === rating ? null : rating">
                    {{ rating }} <StarRating :count="rating" />
                  </button>
                </div>
              </div>
            </fieldset>

            <label for="experience">Experience:</label>
            <select id="experience" v-model="filters.experience">
              <option value="">Any experience</option>
              <option v-for="experience in experienceOptions" :key="experience" :value="experience">{{ experience }}</option>
            </select>

            <div class="filter-actions">
              <button class="clear-button" type="button" @click="clearFilters">Clear</button>
              <button class="search-button" type="submit">Search</button>
            </div>
          </form>
        </aside>

        <section class="results" aria-live="polite">
          <template v-if="loading">
            <div v-if="viewMode === 'map'" class="map-skeleton skeleton"></div>
            <div v-else v-for="item in 4" :key="item" class="card-skeleton skeleton"></div>
          </template>

          <div v-else-if="notice" class="empty-state error-state" role="alert">
            <strong>We couldn't load pet sitters.</strong>
            <span>{{ notice }}</span>
            <button type="button" @click="loadResults">Try again</button>
          </div>

          <div v-else-if="viewMode === 'map'" class="map-stage">
            <SitterMap :sitters="mapSitters" :selected-id="selectedId" @select="selectMapMarker" />
            <div v-if="!mapSitters.length" class="map-empty">
              <img src="/icon/map-pin.svg" alt="" />
              <strong>No mapped pet sitters found</strong>
              <span>Try clearing a filter or switch to List view.</span>
            </div>
            <div
              v-else
              ref="mapCardTrack"
              class="map-card-track"
              :class="{ 'is-dragging': draggingCards }"
              aria-label="Pet sitters on map"
              @pointerdown.stop="startCardDrag"
              @pointermove="moveCardDrag"
              @pointerup="endCardDrag"
              @pointercancel="endCardDrag"
              @lostpointercapture="endCardDrag"
              @pointerleave="!draggingCards && endCardDrag($event)"
              @click.capture="guardCardClick"
              @dragstart.prevent
              @wheel.passive="stopCardAnimation"
            >
              <RouterLink
                v-for="sitter in mapSitters"
                :key="sitter.userId"
                :to="`/sitters/${sitter.userId}`"
                class="map-result-card"
                :data-sitter-id="sitter.userId"
                :class="{ selected: sitter.userId === selectedSitter?.userId }"
                @pointerenter="!cardDrag && !coastingCards && selectSitter(sitter)"
                @focus="!cardDrag && !coastingCards && selectSitter(sitter)"
              >
                <img class="map-card-photo" :src="sitterPhoto(sitter)" :alt="sitter.displayName" />
                <div class="map-card-copy">
                  <div class="map-card-title">
                    <div>
                      <strong>{{ sitter.displayName }}</strong>
                      <span>{{ sitter.ownerName ? `By ${sitter.ownerName}` : 'Pet sitting service' }}</span>
                    </div>
                  </div>
                  <div class="map-card-rating" :aria-label="`${sitter.ratingAvg} stars`">
                    <StarRating :count="ratingStars(sitter)" show-empty />
                  </div>
                  <div class="pet-tags compact-tags">
                    <span v-for="pet in sitter.petTypes" :key="pet" :class="petTypeClass(pet)">{{ pet }}</span>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>

          <div v-else-if="!sitters.length" class="empty-state">
            <img src="/icon/search.svg" alt="" />
            <strong>No pet sitter found</strong>
            <span>Try a broader search or clear your filters.</span>
          </div>

          <template v-else>
            <RouterLink v-for="sitter in sitters" :key="sitter.userId" :to="`/sitters/${sitter.userId}`" class="sitter-card">
              <img class="place-image" :src="sitterPhoto(sitter)" :alt="sitter.displayName" />
              <div class="sitter-info">
                <div class="card-heading">
                  <div class="identity">
                    <img :src="sitterAvatar(sitter)" alt="" />
                    <div>
                      <h2>{{ sitter.displayName }}</h2>
                      <p v-if="sitter.ownerName">By {{ sitter.ownerName }}</p>
                    </div>
                  </div>
                  <div class="stars" :aria-label="`${ratingStars(sitter)} stars`">
                    <StarRating :count="ratingStars(sitter)" show-empty />
                  </div>
                </div>
                <p class="location"><img src="/icon/map-pin.svg" alt="" />{{ sitter.province || 'Location not specified' }}</p>
                <div class="pet-tags">
                  <span v-for="pet in sitter.petTypes" :key="pet" :class="petTypeClass(pet)">{{ pet }}</span>
                </div>
              </div>
            </RouterLink>
          </template>

          <nav v-if="viewMode === 'list' && !loading && !notice && totalPages > 1" class="pagination" aria-label="Pagination">
            <button type="button" aria-label="Previous page" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">‹</button>
            <button v-for="page in totalPages" :key="page" type="button" :aria-current="currentPage === page ? 'page' : undefined" :class="{ active: currentPage === page }" @click="goToPage(page)">{{ page }}</button>
            <button type="button" aria-label="Next page" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">›</button>
          </nav>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.search-page { min-height: 100vh; background: #f8f8fa; color: #292a36; }
.search-main { width: min(100% - 48px, 1232px); min-height: 800px; margin: 0 auto; padding: 64px 0 184px; }
.title-row { margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.title-row h1 { margin: 0; color: #30343f; font-size: 20px; line-height: 28px; font-weight: 600; }
.view-switch, .filter-actions, .identity, .stars, .location, .pet-tags, .pagination { display: flex; align-items: center; }
.view-switch { gap: 8px; padding: 0; }
.view-switch button { height: 34px; padding: 0 12px; display: flex; align-items: center; gap: 6px; border: 1px solid #dde0ef; border-radius: 6px; background: transparent; color: #a2a7b8; font-size: 12px; font-weight: 500; cursor: pointer; }
.view-switch button img { width: 14px; height: 14px; opacity: .65; }
.view-switch button.active { border-color: #ffbda3; background: #fff3ed; color: #ff6525; }
.view-switch button.active img { opacity: 1; filter: invert(48%) sepia(97%) saturate(2761%) hue-rotate(344deg) brightness(103%) contrast(101%); }
.search-layout { display: grid; grid-template-columns: 31% minmax(0, 1fr); gap: 32px; align-items: start; }
.filter-column { position: sticky; top: 96px; z-index: 3; }
.filter-card { padding: 24px 22px 22px; border: 0; border-radius: 18px; background: #fff; box-shadow: 0 8px 24px rgb(38 42 54 / 3%); }
.filter-card > label, .filter-card legend { display: block; margin-bottom: 8px; color: #30343f; font-size: 14px; line-height: 20px; font-weight: 500; }
.search-input-wrap { position: relative; }
.search-input-wrap input, .filter-card select { width: 100%; height: 44px; border: 1px solid #dde0ef; border-radius: 6px; background: #fff; color: #82869b; font-size: 14px; outline: 0; }
.search-input-wrap input { padding: 0 34px 0 11px; }
.search-input-wrap input:focus, .filter-card select:focus { border-color: #ff9b73; box-shadow: 0 0 0 3px #fff0ea; }
.search-input-wrap img { position: absolute; top: 12px; right: 14px; width: 20px; height: 20px; opacity: .45; pointer-events: none; }
.filter-card fieldset { margin: 38px 0 0; padding: 0; border: 0; }
.pet-options { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pet-options label { display: flex; align-items: center; gap: 8px; color: #30343f; font-size: 12px; white-space: nowrap; cursor: pointer; }
.pet-options input { appearance: none; width: 20px; height: 20px; flex: 0 0 20px; margin: 0; border: 1px solid #dde0ef; border-radius: 5px; background: #fff; cursor: pointer; }
.pet-options input:checked { border-color: #ff7037; background: #ff7037 url('/icon/check.svg') center / 15px no-repeat; }
.pet-options input:focus-visible, .rating-options button:focus-visible { outline: 2px solid #ff7037; outline-offset: 3px; }
.rating-options { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.rating-row { display: flex; gap: 6px; }
.rating-options button { height: 32px; padding: 0 8px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #dde0ef; border-radius: 5px; background: #fff; color: #82869b; font-size: 14px; cursor: pointer; }
.rating-options :deep(.star-rating) { --star-size: 19px; --star-gap: 1px; }
.rating-options button.selected { border-color: #1ccd83; background: #edfbf5; color: #30343f; }
.filter-card > label[for='experience'] { margin-top: 38px; }
.filter-card select { appearance: none; padding: 0 36px 0 10px; background: #fff url('/icon/chevron-down.svg') right 12px center / 12px no-repeat; }
.filter-actions { gap: 12px; margin-top: 34px; }
.filter-actions button { width: 50%; height: 44px; border: 0; border-radius: 24px; font-size: 14px; font-weight: 600; cursor: pointer; }
.clear-button { background: #fff1ec; color: #ff7037; }
.search-button { background: #ff7037; color: #fff; }
.results { min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.sitter-card { padding: 16px; display: grid; grid-template-columns: 30% minmax(0, 1fr); gap: 32px; border: 0; border-radius: 16px; background: #fff; color: inherit; text-decoration: none; transition: background-color 150ms ease; }
.sitter-card:hover { background: #fffaf7; }
.sitter-card:focus-visible { outline: 2px solid #ff7037; outline-offset: 3px; }
.place-image { width: 100%; height: 100%; min-height: 0; aspect-ratio: 4 / 3; border-radius: 6px; object-fit: cover; }
.sitter-info { min-width: 0; padding: 6px 4px 2px 0; display: flex; flex-direction: column; justify-content: space-between; gap: 20px; }
.card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.identity { min-width: 0; gap: 10px; }
.identity > img { width: 42px; height: 42px; flex: 0 0 auto; border-radius: 50%; object-fit: cover; }
.identity h2 { margin: 0; color: #161616; font-size: 14px; font-weight: 750; line-height: 1.25; }
.identity p { max-width: 290px; margin: 4px 0 0; overflow: hidden; color: #626779; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.stars { flex: 0 0 auto; gap: 1px; padding-top: 2px; }
.stars :deep(.star-rating) { --star-size: 10px; --star-gap: 2px; }
.location { gap: 5px; margin: 20px 0 0; color: #82869b; font-size: 9px; }
.location img { width: 11px; height: 11px; opacity: .7; }
.pet-tags { flex-wrap: wrap; gap: 5px; margin-top: 13px; }
.pet-tags span { padding: 4px 8px; border: 1px solid; border-radius: 10px; font-size: 8px; line-height: 1; }
.tag-dog { border-color: #83e1bb; background: #effcf6; color: #15a76f; }
.tag-cat { border-color: #f6abc9; background: #fff0f6; color: #d96391; }
.tag-bird { border-color: #a7dcf7; background: #eef9ff; color: #4ba7d9; }
.tag-rabbit { border-color: #ffbda3; background: #fff3ed; color: #e9693e; }
.sitter-card .identity { align-items: flex-start; gap: 14px; }
.sitter-card .identity > img { width: 56px; height: 56px; }
.sitter-card .identity > div { min-width: 0; }
.sitter-card .identity h2 { font-size: 20px; font-weight: 700; line-height: 1.35; overflow-wrap: anywhere; }
.sitter-card .identity p { margin-top: 4px; color: #161616; font-size: 14px; }
.sitter-card .stars { padding-top: 3px; }
.sitter-card .stars :deep(.star-rating) { --star-size: 18px; --star-gap: 2px; }
.sitter-card .location { margin: 0; gap: 6px; font-size: 13px; }
.sitter-card .location img { width: 18px; height: 18px; opacity: .55; }
.sitter-card .pet-tags { gap: 8px; margin: 0; }
.sitter-card .pet-tags span { padding: 6px 12px; border-radius: 16px; font-size: 12px; }
.search-main.map-view { min-height: 0; padding-bottom: 72px; }
.map-stage { position: relative; aspect-ratio: 1; min-height: 560px; overflow: hidden; border-radius: 12px; background: #edf3ef; }
.map-stage :deep(.sitter-map) { position: absolute; inset: 0; }
.map-card-track { position: absolute; z-index: 500; right: 0; bottom: 24px; left: 0; display: flex; gap: 12px; overflow-x: auto; padding: 4px 16px; scroll-behavior: auto; overscroll-behavior-x: contain; scrollbar-width: none; }
.map-card-track::-webkit-scrollbar { display: none; }
.map-card-track { cursor: grab; user-select: none; }
.map-card-track .map-result-card { cursor: inherit; }
.map-card-track.is-dragging { cursor: grabbing; scroll-snap-type: none; scroll-behavior: auto; }
.map-result-card { position: relative; width: 420px; min-width: 420px; padding: 8px; display: grid; grid-template-columns: 124px 1fr; gap: 12px; border: 1px solid transparent; border-radius: 8px; background: #fff; color: inherit; text-decoration: none; scroll-snap-align: center; }
.map-result-card:hover, .map-result-card.selected { border-color: #ff7037; }
.map-result-card:focus-visible { outline: 2px solid #ff7037; outline-offset: 2px; }
.map-card-photo { width: 124px; height: 104px; border-radius: 4px; object-fit: cover; }
.map-card-copy { min-width: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 4px 0; }
.map-card-title { display: flex; align-items: center; gap: 7px; }
.map-card-title > img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
.map-card-title strong, .map-card-title span { display: block; max-width: 165px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.map-card-rating { position: absolute; top: 10px; right: 8px; }
.map-card-rating :deep(.star-rating) { --star-size: 10px; --star-gap: 1px; }
.map-card-title strong { color: #20232d; font-size: 14px; }
.map-card-title span { margin-top: 2px; color: #30343f; font-size: 10px; }
.map-card-meta { margin-top: 8px; display: flex; align-items: center; gap: 7px; color: #858a9c; font-size: 7px; }
.mini-rating { display: inline-flex; align-items: center; gap: 3px; color: #14a46d; font-weight: 700; }
.mini-rating svg { width: 14px; height: 14px; fill: #1ccd83; }
.compact-tags { margin-top: 7px; flex-wrap: nowrap; overflow: hidden; }
.compact-tags span { padding: 4px 8px; font-size: 10px; }
.map-empty { position: absolute; z-index: 450; top: 50%; left: 50%; width: 250px; padding: 24px; display: grid; place-items: center; border-radius: 16px; background: rgb(255 255 255 / 92%); box-shadow: 0 18px 45px rgb(38 42 54 / 15%); text-align: center; transform: translate(-50%, -50%); }
.map-empty img { width: 26px; opacity: .55; }
.map-empty strong { margin-top: 10px; font-size: 12px; }
.map-empty span { margin-top: 5px; color: #8b90a2; font-size: 9px; }
.empty-state { min-height: 260px; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 17px; background: #fff; color: #82869b; text-align: center; }
.empty-state img { width: 26px; margin-bottom: 12px; opacity: .45; }
.empty-state strong { color: #30343f; font-size: 14px; }
.empty-state span { margin-top: 6px; font-size: 10px; }
.empty-state button { margin-top: 16px; padding: 8px 16px; border: 0; border-radius: 18px; background: #ff6525; color: white; font-size: 10px; font-weight: 700; }
.error-state strong { color: #b42318; }
.pagination { justify-content: flex-start; gap: 10px; margin-top: 8px; padding-left: 48px; }
.pagination button { width: 36px; height: 36px; border: 0; border-radius: 50%; background: #fff; color: #adb1c6; font-size: 14px; cursor: pointer; }
.pagination button:first-child, .pagination button:last-child { background: transparent; font-size: 24px; }
.pagination button.active { background: #ffeae3; color: #ff6525; }
.pagination button:disabled { cursor: not-allowed; opacity: .45; }
.skeleton { position: relative; overflow: hidden; border-radius: 17px; background: #e9ebf1; }
.skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 25%, rgb(255 255 255 / 60%) 50%, transparent 75%); transform: translateX(-100%); animation: shimmer 1.4s infinite; }
.card-skeleton { height: 174px; }
.map-skeleton { height: 590px; border-radius: 20px; }
@keyframes shimmer { to { transform: translateX(100%); } }

@media (min-width: 821px) and (max-width: 1100px) {
  .search-layout { grid-template-columns: 320px minmax(0, 1fr); gap: 24px; }
  .filter-card { padding: 24px 16px; }
  .pet-options label { gap: 5px; font-size: 11px; }
  .rating-options :deep(.star-rating) { --star-size: 16px; }
  .sitter-card { gap: 16px; }
  .sitter-card .card-heading { flex-wrap: wrap; }
  .sitter-card .identity h2 { font-size: 16px; }
  .sitter-card .identity > img { width: 40px; height: 40px; }
}

@media (max-width: 820px) {
  .search-main { width: min(100% - 28px, 740px); min-height: auto; padding: 34px 0 64px; }
  .search-layout { grid-template-columns: 1fr; gap: 20px; }
  .filter-column { position: static; }
  .title-row { margin-bottom: 24px; }
  .map-stage { min-height: 470px; }
  .map-card-track { bottom: 24px; }
}

@media (max-width: 560px) {
  .title-row { align-items: flex-start; }
  .view-switch button { padding: 0 10px; }
  .view-switch button img { width: 13px; }
  .result-count { display: none; }
  .sitter-card { grid-template-columns: 30% minmax(0, 1fr); gap: 14px; padding: 10px; }
  .place-image { min-height: 110px; }
  .sitter-info { gap: 14px; padding: 2px 0; }
  .sitter-card .identity { gap: 7px; }
  .sitter-card .identity > img { width: 32px; height: 32px; }
  .sitter-card .identity h2 { font-size: 13px; }
  .sitter-card .identity p { font-size: 10px; }
  .sitter-card .stars :deep(.star-rating) { --star-size: 11px; --star-gap: 1px; }
  .sitter-card .location { font-size: 9px; }
  .sitter-card .location img { width: 12px; height: 12px; }
  .sitter-card .pet-tags { gap: 5px; }
  .sitter-card .pet-tags span { padding: 4px 8px; font-size: 9px; }
  .identity p { max-width: 170px; }
  .location { margin-top: 15px; }
  .map-result-card { width: 310px; min-width: 310px; grid-template-columns: 88px 1fr; gap: 8px; }
  .map-card-photo { width: 88px; height: 88px; }
  .map-card-title strong, .map-card-title span { max-width: 132px; }
  .map-card-title strong { font-size: 12px; }
  .map-card-rating { top: auto; bottom: 40px; }
  .compact-tags span { padding: 3px 6px; font-size: 9px; }
}
@media (max-width: 400px) {
  .sitter-card .card-heading { flex-wrap: wrap; gap: 6px; }
}
</style>
