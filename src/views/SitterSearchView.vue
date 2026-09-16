<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Footer, Navbar } from '../components'
import { getListedSitters, type ListedSitter } from '../services/sitterApproval'

const petTypeOptions = ['Dog', 'Cat', 'Bird', 'Rabbit']
const sitters = ref<ListedSitter[]>([])
const loading = ref(true)
const notice = ref('')

const filters = reactive({
  keyword: '',
  petTypes: [] as string[],
})

const filteredSitters = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()

  return sitters.value.filter((sitter) => {
    const searchable = [
      sitter.displayName,
      sitter.services,
      sitter.introduction,
      sitter.province,
    ].filter(Boolean).join(' ').toLowerCase()
    const matchesKeyword = !keyword || searchable.includes(keyword)
    const matchesPet = !filters.petTypes.length || filters.petTypes.some((pet) => sitter.petTypes.includes(pet))
    return matchesKeyword && matchesPet
  })
})

function clearFilters() {
  filters.keyword = ''
  filters.petTypes = []
}

function petTypeClass(petType: string) {
  return `tag-${petType.toLowerCase()}`
}

onMounted(async () => {
  try {
    sitters.value = await getListedSitters()
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูล Pet Sitter ได้'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="search-page">
    <Navbar />

    <main class="search-main">
      <div class="title-row">
        <h1>Search For Pet Sitter</h1>
        <div class="view-switch" aria-label="View mode">
          <button class="active" type="button"><img src="/icon/list.svg" alt="" />List</button>
          <button type="button" disabled><img src="/icon/map.svg" alt="" />Map</button>
        </div>
      </div>

      <div class="search-layout">
        <aside class="filter-column">
          <form class="filter-card" @submit.prevent>
            <label for="search-input">Search</label>
            <div class="search-input-wrap">
              <input id="search-input" v-model="filters.keyword" type="search" />
              <img src="/icon/search.svg" alt="" />
            </div>

            <fieldset>
              <legend>Pet Type:</legend>
              <div class="pet-options">
                <label v-for="pet in petTypeOptions" :key="pet">
                  <input v-model="filters.petTypes" type="checkbox" :value="pet" />
                  {{ pet }}
                </label>
              </div>
            </fieldset>

            <div class="filter-actions">
              <button class="clear-button" type="button" @click="clearFilters">Clear</button>
              <button class="search-button" type="submit">Search</button>
            </div>
          </form>
        </aside>

        <section class="results" aria-live="polite">
          <div v-if="loading" class="empty-state">Loading pet sitters...</div>
          <div v-else-if="notice" class="empty-state error-state" role="alert">{{ notice }}</div>
          <div v-else-if="!filteredSitters.length" class="empty-state">No pet sitter found.</div>
          <template v-else>
            <article v-for="sitter in filteredSitters" :key="sitter.userId" class="sitter-card">
              <img
                class="place-image"
                :src="sitter.avatarUrl || '/image/services-cat.png'"
                :alt="sitter.displayName"
              />
              <div class="sitter-info">
                <div class="card-heading">
                  <div class="identity">
                    <img :src="sitter.avatarUrl || '/icon/user.svg'" alt="" />
                    <div>
                      <h2>{{ sitter.displayName }}</h2>
                      <p>{{ sitter.services || sitter.introduction || 'Pet sitting service' }}</p>
                    </div>
                  </div>
                </div>
                <p class="location">
                  <img src="/icon/map-pin.svg" alt="" />{{ sitter.province || 'Location not specified' }}
                </p>
                <div class="pet-tags">
                  <span v-for="pet in sitter.petTypes" :key="pet" :class="petTypeClass(pet)">{{ pet }}</span>
                </div>
              </div>
            </article>
          </template>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f7f8fb;
  color: #292a36;
}

.view-switch,
.filter-actions,
.identity,
.location,
.pet-tags {
  display: flex;
  align-items: center;
}

.search-main {
  width: min(100% - 40px, 940px);
  min-height: 900px;
  margin: 0 auto;
  padding-top: 56px;
}

.title-row {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-row h1 {
  margin: 0;
  color: #161616;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -.02em;
}

.view-switch { gap: 8px; }

.view-switch button {
  height: 27px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #dde0ef;
  border-radius: 8px;
  background: #fff;
  color: #adb1c6;
  font-size: 9px;
}

.view-switch button img { width: 12px; height: 12px; opacity: .65; }
.view-switch button.active { border-color: #ff6525; color: #ff6525; }

.search-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 30px;
  align-items: start;
}

.filter-column {
  position: sticky;
  top: 92px;
}

.filter-card {
  padding: 22px 18px 18px;
  border: 1px solid #e2e7f0;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 16px 44px -18px rgb(0 0 0 / 12%);
}

.filter-card > label,
.filter-card legend {
  display: block;
  margin-bottom: 10px;
  color: #232733;
  font-size: 11px;
  font-weight: 700;
}

.search-input-wrap { position: relative; }

.search-input-wrap input {
  width: 100%;
  height: 35px;
  border: 1px solid #dde0ef;
  border-radius: 9px;
  background: #fff;
  color: #82869b;
  font-size: 10px;
  outline: 0;
}

.search-input-wrap input { padding: 0 32px 0 10px; }
.search-input-wrap img { position: absolute; top: 11px; right: 10px; width: 13px; height: 13px; }

.filter-card fieldset {
  margin: 24px 0 0;
  padding: 0;
  border: 0;
}

.pet-options {
  display: grid;
  grid-template-columns: repeat(4, auto);
  justify-content: space-between;
  gap: 5px;
}

.pet-options label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #565a6c;
  font-size: 8px;
}

.pet-options input { width: 11px; height: 11px; margin: 0; accent-color: #ff6525; }

.filter-actions {
  gap: 12px;
  margin-top: 25px;
}

.filter-actions button {
  width: 50%;
  height: 32px;
  border: 0;
  border-radius: 18px;
  font-size: 9px;
  font-weight: 700;
}

.clear-button { background: #ffeae3; color: #ff6525; }
.search-button { background: #ff6525; color: #fff; }

.results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sitter-card {
  min-height: 131px;
  padding: 11px;
  display: grid;
  grid-template-columns: 164px minmax(0, 1fr);
  gap: 16px;
  border: 1px solid #e7ecf3;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 32px -22px rgb(0 0 0 / 18%);
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.sitter-card:hover { transform: translateY(-2px); box-shadow: 0 18px 38px -22px rgb(0 0 0 / 24%); }

.place-image {
  width: 164px;
  height: 111px;
  border-radius: 11px;
  object-fit: cover;
}

.sitter-info { min-width: 0; padding: 4px 2px 0 0; }
.card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.identity { min-width: 0; gap: 10px; }
.identity > img { width: 37px; height: 37px; flex: 0 0 auto; border-radius: 50%; object-fit: cover; }
.identity h2 { margin: 0; color: #161616; font-size: 13px; font-weight: 700; line-height: 1.25; }
.identity p { margin: 3px 0 0; color: #30343f; font-size: 9px; }
.location {
  gap: 4px;
  margin: 18px 0 0;
  color: #82869b;
  font-size: 8px;
}

.location img { width: 10px; height: 10px; opacity: .7; }
.pet-tags { gap: 5px; margin-top: 12px; }

.pet-tags span {
  padding: 3px 7px;
  border: 1px solid;
  border-radius: 10px;
  font-size: 8px;
  line-height: 1;
}

.tag-dog { border-color: #83e1bb; background: #effcf6; color: #1ccd83; }
.tag-cat { border-color: #f6abc9; background: #fff0f6; color: #ee82ac; }
.tag-bird { border-color: #a7dcf7; background: #eef9ff; color: #65b7e6; }
.tag-rabbit { border-color: #ffbda3; background: #fff3ed; color: #ff8054; }

.empty-state {
  padding: 60px 20px;
  border-radius: 10px;
  background: #fff;
  color: #82869b;
  text-align: center;
  font-size: 12px;
}
.error-state { color: #b42318; }

@media (max-width: 760px) {
  .search-main { width: min(100% - 28px, 900px); }
  .search-main { min-height: auto; padding: 28px 0 60px; }
  .title-row { margin-bottom: 20px; }
  .search-layout { grid-template-columns: 1fr; gap: 20px; }
  .filter-column { position: static; }
  .pet-options { justify-content: start; gap: 18px; }
  .sitter-card { grid-template-columns: 125px minmax(0, 1fr); }
  .place-image { width: 125px; }
  .identity > img { display: none; }
}

@media (max-width: 480px) {
  .view-switch { display: none; }
  .sitter-card { grid-template-columns: 100px minmax(0, 1fr); gap: 10px; }
  .place-image { width: 100px; }
  .identity h2 { white-space: normal; }
  .location { margin-top: 14px; }
}
</style>
