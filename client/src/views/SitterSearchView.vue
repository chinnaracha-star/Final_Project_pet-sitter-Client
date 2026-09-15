<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

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
    <header class="topbar">
      <div class="topbar-inner">
        <RouterLink to="/search" aria-label="Sitter home">
          <img class="brand-logo" src="/navbar/logo-sitter.svg" alt="Sitter" />
        </RouterLink>

        <div class="topbar-actions">
          <button class="round-action" type="button" aria-label="Notifications">
            <img src="/navbar/icon-bell.svg" alt="" />
            <span class="notification-dot"></span>
          </button>
          <button class="round-action" type="button" aria-label="Messages">
            <img src="/navbar/icon-chat.svg" alt="" />
          </button>
          <RouterLink class="profile-link" to="/owner/profile" aria-label="Profile">
            <img src="/navbar/profile.png" alt="Profile" />
          </RouterLink>
          <RouterLink class="find-button" to="/search">Find A Pet Sitter</RouterLink>
        </div>
      </div>
    </header>

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

    <footer class="footer">
      <img src="/image/Sitter-logo-white.svg" alt="Sitter" />
      <p>Find your perfect pet sitter with us.</p>
    </footer>
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f8f8fa;
  color: #30343f;
}

.topbar {
  height: 64px;
  background: #fff;
}

.topbar-inner {
  width: min(100% - 40px, 900px);
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-logo {
  display: block;
  width: 82px;
  height: auto;
}

.topbar-actions,
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

.topbar-actions { gap: 9px; }

.round-action {
  position: relative;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #f7f8fb;
}

.round-action img { width: 14px; height: 14px; }

.notification-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ff7037;
}

.profile-link,
.profile-link img {
  display: block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.find-button {
  margin-left: 4px;
  padding: 9px 17px;
  border-radius: 20px;
  background: #ff7037;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-decoration: none;
}

.search-main {
  width: min(100% - 40px, 900px);
  min-height: 970px;
  margin: 0 auto;
  padding-top: 44px;
}

.title-row {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-row h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.view-switch { gap: 8px; }

.view-switch button {
  height: 27px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #dde0ef;
  border-radius: 4px;
  background: #fff;
  color: #adb1c6;
  font-size: 9px;
}

.view-switch button img { width: 12px; height: 12px; opacity: .65; }
.view-switch button.active { border-color: #ff7037; color: #ff7037; }

.search-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 30px;
  align-items: start;
}

.filter-column {
  position: sticky;
  top: 20px;
}

.filter-card {
  padding: 18px 16px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 5px 18px rgb(48 52 63 / 3%);
}

.filter-card > label,
.filter-card legend {
  display: block;
  margin-bottom: 10px;
  color: #30343f;
  font-size: 10px;
  font-weight: 600;
}

.search-input-wrap { position: relative; }

.search-input-wrap input,
.filter-card select {
  width: 100%;
  height: 35px;
  border: 1px solid #dde0ef;
  border-radius: 5px;
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

.pet-options input { width: 10px; height: 10px; margin: 0; accent-color: #ff7037; }

.rating-options {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.rating-options button {
  height: 20px;
  padding: 0 5px;
  border: 1px solid #dde0ef;
  border-radius: 3px;
  background: #fff;
  color: #82869b;
  font-size: 8px;
}

.rating-options button span { color: #1ccd83; letter-spacing: 1px; }
.rating-options button.selected { border-color: #1ccd83; background: #edfbf5; }
.filter-card > label[for="experience"] { margin-top: 24px; }
.filter-card select { padding: 0 9px; }

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

.clear-button { background: #fff2ec; color: #ff7037; }
.search-button { background: #ff7037; color: #fff; }

.results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sitter-card {
  min-height: 131px;
  padding: 10px;
  display: grid;
  grid-template-columns: 164px minmax(0, 1fr);
  gap: 16px;
  border-radius: 10px;
  background: #fff;
}

.place-image {
  width: 164px;
  height: 111px;
  border-radius: 7px;
  object-fit: cover;
}

.sitter-info { min-width: 0; padding: 4px 2px 0 0; }
.card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.identity { min-width: 0; gap: 10px; }
.identity > img { width: 37px; height: 37px; flex: 0 0 auto; border-radius: 50%; object-fit: cover; }
.identity h2 { margin: 0; font-size: 13px; font-weight: 700; line-height: 1.25; }
.identity p { margin: 3px 0 0; color: #30343f; font-size: 9px; }
.stars { flex: 0 0 auto; gap: 1px; padding-top: 2px; }
.stars img { width: 12px; height: 12px; }

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

.pagination { justify-content: center; gap: 5px; margin-top: 10px; }
.pagination button { width: 25px; height: 25px; border: 0; border-radius: 50%; background: transparent; color: #adb1c6; font-size: 10px; }
.pagination button.active { background: #fff2ec; color: #ff7037; }

.footer {
  height: 190px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
}

.footer img { width: 113px; height: auto; }
.footer p { margin: 12px 0 0; font-size: 11px; }

@media (max-width: 760px) {
  .topbar-inner,
  .search-main { width: min(100% - 28px, 900px); }
  .find-button { display: none; }
  .search-main { min-height: auto; padding: 28px 0 60px; }
  .title-row { margin-bottom: 20px; }
  .search-layout { grid-template-columns: 1fr; gap: 20px; }
  .filter-column { position: static; }
  .pet-options { justify-content: start; gap: 18px; }
  .sitter-card { grid-template-columns: 125px minmax(0, 1fr); }
  .place-image { width: 125px; }
  .identity > img { display: none; }
  .stars img { width: 10px; height: 10px; }
}

@media (max-width: 480px) {
  .view-switch { display: none; }
  .sitter-card { grid-template-columns: 100px minmax(0, 1fr); gap: 10px; }
  .place-image { width: 100px; }
  .identity h2 { white-space: normal; }
  .location { margin-top: 14px; }
}
</style>
