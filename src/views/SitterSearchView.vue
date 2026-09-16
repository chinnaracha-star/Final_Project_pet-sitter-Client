<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Footer, Navbar } from '../components'

type Sitter = {
  name: string
  owner: string
  location: string
  image: string
  avatar: string
  rating: number
  experience: string
  petTypes: string[]
}

const petTypeOptions = ['Dog', 'Cat', 'Bird', 'Rabbit']
const experienceOptions = ['0-2 Years', '3-5 Years', '5+ Years']
const ratingOptions = [5, 4, 3, 2, 1]

const sitters: Sitter[] = [
  {
    name: 'Happy House!',
    owner: 'Jane Maison',
    location: 'Sena Nikhom, Bangkok',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=520&q=85',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=85',
    rating: 5,
    experience: '3-5 Years',
    petTypes: ['Dog', 'Cat', 'Rabbit'],
  },
  {
    name: 'We love cat and your cat',
    owner: 'Cat Lover',
    location: 'Sena Nikhom, Bangkok',
    image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=520&q=85',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=85',
    rating: 5,
    experience: '0-2 Years',
    petTypes: ['Cat'],
  },
  {
    name: 'Gentle >< for all pet! (Kid friendly)',
    owner: 'Umai',
    location: 'Sena Nikhom, Bangkok',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=520&q=85',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=85',
    rating: 5,
    experience: '5+ Years',
    petTypes: ['Dog', 'Cat', 'Bird', 'Rabbit'],
  },
  {
    name: 'Happy energetic pup',
    owner: 'Nanny Black',
    location: 'Sena Nikhom, Bangkok',
    image: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=520&q=85',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=85',
    rating: 4,
    experience: '3-5 Years',
    petTypes: ['Dog'],
  },
  {
    name: 'Cat Mom',
    owner: 'Mother of Cat',
    location: 'Sena Nikhom, Bangkok',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=520&q=85',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=100&q=85',
    rating: 4,
    experience: '0-2 Years',
    petTypes: ['Dog', 'Cat', 'Rabbit'],
  },
]

const filters = reactive({
  keyword: '',
  petTypes: [] as string[],
  rating: null as number | null,
  experience: '',
})
const currentPage = ref(1)

const filteredSitters = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()

  return sitters.filter((sitter) => {
    const matchesKeyword = !keyword || `${sitter.name} ${sitter.owner}`.toLowerCase().includes(keyword)
    const matchesPet = !filters.petTypes.length || filters.petTypes.some((pet) => sitter.petTypes.includes(pet))
    const matchesRating = filters.rating === null || sitter.rating >= filters.rating
    const matchesExperience = !filters.experience || sitter.experience === filters.experience
    return matchesKeyword && matchesPet && matchesRating && matchesExperience
  })
})

function clearFilters() {
  filters.keyword = ''
  filters.petTypes = []
  filters.rating = null
  filters.experience = ''
  currentPage.value = 1
}

function petTypeClass(petType: string) {
  return `tag-${petType.toLowerCase()}`
}
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
          <form class="filter-card" @submit.prevent="currentPage = 1">
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

            <fieldset>
              <legend>Rating:</legend>
              <div class="rating-options">
                <button
                  v-for="rating in ratingOptions"
                  :key="rating"
                  type="button"
                  :class="{ selected: filters.rating === rating }"
                  @click="filters.rating = filters.rating === rating ? null : rating"
                >
                  {{ rating }} <span>{{ '★'.repeat(rating) }}</span>
                </button>
              </div>
            </fieldset>

            <label for="experience">Experience:</label>
            <select id="experience" v-model="filters.experience">
              <option value="">0-2 Years</option>
              <option v-for="experience in experienceOptions.slice(1)" :key="experience" :value="experience">
                {{ experience }}
              </option>
            </select>

            <div class="filter-actions">
              <button class="clear-button" type="button" @click="clearFilters">Clear</button>
              <button class="search-button" type="submit">Search</button>
            </div>
          </form>
        </aside>

        <section class="results" aria-live="polite">
          <article v-for="sitter in filteredSitters" :key="sitter.name" class="sitter-card">
            <img class="place-image" :src="sitter.image" :alt="sitter.name" />
            <div class="sitter-info">
              <div class="card-heading">
                <div class="identity">
                  <img :src="sitter.avatar" alt="" />
                  <div>
                    <h2>{{ sitter.name }}</h2>
                    <p>By {{ sitter.owner }}</p>
                  </div>
                </div>
                <div class="stars" :aria-label="`${sitter.rating} stars`">
                  <img v-for="star in sitter.rating" :key="star" src="/icon/star.svg" alt="" />
                </div>
              </div>
              <p class="location"><img src="/icon/map-pin.svg" alt="" />{{ sitter.location }}</p>
              <div class="pet-tags">
                <span v-for="pet in sitter.petTypes" :key="pet" :class="petTypeClass(pet)">{{ pet }}</span>
              </div>
            </div>
          </article>

          <div v-if="!filteredSitters.length" class="empty-state">No pet sitter found.</div>

          <nav v-else class="pagination" aria-label="Pagination">
            <button type="button" aria-label="Previous page">‹</button>
            <button
              v-for="page in [1, 2, 3, 4]"
              :key="page"
              type="button"
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >{{ page }}</button>
            <button type="button" aria-label="Next page">›</button>
          </nav>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 2% 20%, rgb(255 202 98 / 18%) 0 80px, transparent 81px),
    radial-gradient(circle at 98% 8%, rgb(110 210 250 / 13%) 0 120px, transparent 121px),
    #f8f9fc;
  color: #292a36;
}

.view-switch,
.filter-actions,
.identity,
.stars,
.location,
.pet-tags,
.pagination {
  display: flex;
  align-items: center;
}

.search-main {
  width: min(100% - 48px, 1120px);
  min-height: 920px;
  margin: 0 auto;
  padding: 72px 0 96px;
}

.title-row {
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-row h1 {
  margin: 0;
  color: #161616;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -.02em;
}

.view-switch { gap: 8px; }

.view-switch button {
  height: 36px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #dde0ef;
  border-radius: 11px;
  background: #fff;
  color: #adb1c6;
  font-size: 12px;
  font-weight: 600;
}

.view-switch button img { width: 15px; height: 15px; opacity: .65; }
.view-switch button.active { border-color: #ff6525; color: #ff6525; }

.search-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 36px;
  align-items: start;
}

.filter-column {
  position: sticky;
  top: 92px;
}

.filter-card {
  padding: 28px 24px 24px;
  border: 1px solid #e2e7f0;
  border-radius: 26px;
  background: #fff;
  box-shadow: 0 16px 44px -10px rgb(0 0 0 / 8%);
}

.filter-card > label,
.filter-card legend {
  display: block;
  margin-bottom: 10px;
  color: #232733;
  font-size: 14px;
  font-weight: 700;
}

.search-input-wrap { position: relative; }

.search-input-wrap input,
.filter-card select {
  width: 100%;
  height: 44px;
  border: 1px solid #dde0ef;
  border-radius: 11px;
  background: #fff;
  color: #82869b;
  font-size: 13px;
  outline: 0;
}

.search-input-wrap input { padding: 0 40px 0 13px; }
.search-input-wrap img { position: absolute; top: 14px; right: 13px; width: 16px; height: 16px; }

.filter-card fieldset {
  margin: 28px 0 0;
  padding: 0;
  border: 0;
}

.pet-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 18px;
}

.pet-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #565a6c;
  font-size: 13px;
}

.pet-options input { width: 16px; height: 16px; margin: 0; accent-color: #ff6525; }

.rating-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rating-options button {
  height: 30px;
  padding: 0 8px;
  border: 1px solid #dde0ef;
  border-radius: 9px;
  background: #fff;
  color: #82869b;
  font-size: 11px;
}

.rating-options button span { color: #1ccd83; letter-spacing: 1px; }
.rating-options button.selected { border-color: #1ccd83; background: #edfbf5; }
.filter-card > label[for="experience"] { margin-top: 28px; }
.filter-card select { padding: 0 12px; }

.filter-actions {
  gap: 12px;
  margin-top: 30px;
}

.filter-actions button {
  width: 50%;
  height: 42px;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.clear-button { background: #ffeae3; color: #ff6525; }
.search-button { background: #ff6525; color: #fff; }

.results {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sitter-card {
  min-height: 164px;
  padding: 12px;
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 20px;
  border: 1px solid #e7ecf3;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 12px 32px -22px rgb(0 0 0 / 18%);
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.sitter-card:hover { transform: translateY(-2px); box-shadow: 0 18px 38px -22px rgb(0 0 0 / 24%); }

.place-image {
  width: 210px;
  height: 140px;
  border-radius: 16px;
  object-fit: cover;
}

.sitter-info { min-width: 0; padding: 8px 5px 0 0; }
.card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.identity { min-width: 0; gap: 12px; }
.identity > img { width: 44px; height: 44px; flex: 0 0 auto; border-radius: 50%; object-fit: cover; }
.identity h2 { margin: 0; color: #161616; font-size: 16px; font-weight: 700; line-height: 1.25; }
.identity p { margin: 4px 0 0; color: #565a6c; font-size: 11px; }
.stars { flex: 0 0 auto; gap: 1px; padding-top: 2px; }
.stars img { width: 15px; height: 15px; }

.location {
  gap: 4px;
  margin: 20px 0 0;
  color: #82869b;
  font-size: 10px;
}

.location img { width: 13px; height: 13px; opacity: .7; }
.pet-tags { gap: 7px; margin-top: 13px; }

.pet-tags span {
  padding: 4px 9px;
  border: 1px solid;
  border-radius: 10px;
  font-size: 10px;
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

.pagination { justify-content: center; gap: 6px; margin-top: 16px; }
.pagination button { width: 32px; height: 32px; border: 0; border-radius: 50%; background: transparent; color: #adb1c6; font-size: 12px; }
.pagination button.active { background: #ffeae3; color: #ff6525; }

@media (max-width: 760px) {
  .search-main { width: min(100% - 28px, 900px); }
  .search-main { min-height: auto; padding: 42px 0 70px; }
  .title-row { margin-bottom: 20px; }
  .search-layout { grid-template-columns: 1fr; gap: 20px; }
  .filter-column { position: static; }
  .pet-options { grid-template-columns: repeat(4, auto); justify-content: start; gap: 18px; }
  .sitter-card { grid-template-columns: 125px minmax(0, 1fr); }
  .place-image { width: 125px; }
  .identity > img { display: none; }
  .stars img { width: 10px; height: 10px; }
}

@media (max-width: 480px) {
  .view-switch { display: none; }
  .title-row h1 { font-size: 23px; }
  .filter-card { padding: 22px 18px; border-radius: 20px; }
  .pet-options { grid-template-columns: repeat(2, 1fr); }
  .sitter-card { grid-template-columns: 105px minmax(0, 1fr); min-height: 138px; gap: 11px; border-radius: 18px; }
  .place-image { width: 105px; height: 112px; border-radius: 13px; }
  .identity h2 { white-space: normal; }
  .location { margin-top: 14px; }
}
</style>
