<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Footer, Navbar } from '../components'
import SitterLocationMap from '../components/search/SitterLocationMap.vue'
import { BookingCalendarModal, type BookingSchedule } from '../components/booking'
import { useBookingStore } from '../stores/booking'
import {
  getPublicSitter,
  getPublicSitterReviews,
  type PublicReview,
  type PublicSitterDetail,
} from '../services/sitterApproval'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const profile = ref<PublicSitterDetail | null>(null)
const reviews = ref<PublicReview[]>([])
const loading = ref(true)
const notice = ref('')
const notFound = ref(false)
const isBookingCalendarOpen = ref(false)

const fallbackGallery = [
  '/image/services-cat-large.png',
  '/image/dog1.jpg',
  '/image/cat.jpg',
  '/image/dog2.jpg',
]

const gallery = computed(() => {
  const photos = profile.value?.photoUrls.filter(Boolean) || []
  return [...photos, ...fallbackGallery].slice(0, 4)
})

const starCount = computed(() => Math.round(Math.max(0, Math.min(5, profile.value?.ratingAvg || 0))))

const fullAddress = computed(() => {
  if (!profile.value) return ''
  return [
    profile.value.addressDetail,
    profile.value.subDistrict,
    profile.value.district,
    profile.value.province,
    profile.value.postCode,
  ].filter(Boolean).join(', ')
})

const experienceLabel = computed(() => {
  const value = profile.value?.experienceYears?.trim()
  if (!value) return 'Experience not specified'
  if (/^\d+(\.\d+)?$/.test(value)) return `${value} Years Exp.`
  return `${value} Exp.`
})

function petTypeClass(petType: string) {
  return `tag-${petType.toLowerCase()}`
}

function reviewDate(value: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

onMounted(async () => {
  const sitterId = String(route.params.id || '')
  try {
    const [detail, latestReviews] = await Promise.all([
      getPublicSitter(sitterId),
      getPublicSitterReviews(sitterId),
    ])
    profile.value = detail
    reviews.value = latestReviews
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load this pet sitter.'
    notFound.value = /not found|404/i.test(message)
    notice.value = message
  } finally {
    loading.value = false
  }
})

function handleBookNow() {
  if (!profile.value) return
  isBookingCalendarOpen.value = true
}

function handleCalendarContinue(schedule: BookingSchedule) {
  if (!profile.value) return

  // Calculate dynamic hourly rate based on sitter experience or profile
  const years = parseFloat(profile.value.experienceYears || '1.5')
  let rate = 200
  if (!isNaN(years)) {
    if (years >= 5) rate = 300
    else if (years >= 3) rate = 250
    else if (years >= 2) rate = 220
    else rate = 200
  }

  bookingStore.setSitter({
    id: profile.value.userId,
    placeName: profile.value.displayName || profile.value.myPlace || 'Pet Sitter House',
    ownerName: profile.value.ownerName || 'Verified Sitter',
    hourlyRate: rate,
  })
  bookingStore.setSchedule(schedule)
  isBookingCalendarOpen.value = false
  void router.push('/booking/pet')
}
</script>

<template>
  <div class="public-profile-page">
    <Navbar />

    <main v-if="loading" class="profile-main" aria-label="Loading pet sitter profile">
      <div class="gallery-skeleton skeleton"></div>
      <div class="profile-loading-grid">
        <div>
          <div class="heading-skeleton skeleton"></div>
          <div v-for="item in 4" :key="item" class="line-skeleton skeleton"></div>
        </div>
        <div class="booking-skeleton skeleton"></div>
      </div>
    </main>

    <main v-else-if="notFound" class="profile-main not-found-page">
      <div class="not-found-card">
        <div class="not-found-icon">404</div>
        <h1>Pet sitter not found</h1>
        <p>This profile may be unavailable or no longer listed.</p>
        <RouterLink to="/search">Back to Search</RouterLink>
      </div>
    </main>

    <main v-else-if="profile" class="profile-main">
      <RouterLink to="/search" class="back-link">← Back to search</RouterLink>

      <section class="gallery" aria-label="Pet sitter gallery">
        <img class="gallery-hero" :src="gallery[0]" :alt="profile.displayName" />
        <img v-for="(photo, index) in gallery.slice(1)" :key="`${photo}-${index}`" class="gallery-tile" :src="photo" alt="" />
      </section>

      <div class="profile-layout">
        <article class="profile-content">
          <header class="profile-heading">
            <p class="profile-eyebrow">Trusted pet sitter</p>
            <h1>{{ profile.displayName }}</h1>
            <div class="heading-meta">
              <span class="rating"><strong>{{ profile.ratingAvg.toFixed(1) }}</strong> ★ · {{ profile.reviewCount }} reviews</span>
              <span><img src="/icon/map-pin.svg" alt="" />{{ fullAddress || 'Location not specified' }}</span>
              <span>{{ profile.experienceYears || 'Experience not specified' }}</span>
            </div>
            <div class="pet-tags">
              <span v-for="pet in profile.petTypes" :key="pet" :class="petTypeClass(pet)">{{ pet }}</span>
            </div>
          </header>

          <section class="copy-section">
            <h2>Introduction</h2>
            <p>{{ profile.introduction || `${profile.displayName} provides warm, attentive care for every pet.` }}</p>
          </section>

          <section class="copy-section">
            <h2>Services</h2>
            <p>{{ profile.services || 'Pet sitting service details will be available soon.' }}</p>
          </section>

          <section class="copy-section">
            <h2>My Place</h2>
            <p>{{ profile.myPlace || 'A comfortable and pet-friendly space prepared with care.' }}</p>
          </section>

          <section class="copy-section location-section">
            <div class="section-title-row">
              <div>
                <h2>Location</h2>
                <p>{{ fullAddress || 'Address not specified' }}</p>
              </div>
              <img src="/icon/map-pin.svg" alt="" />
            </div>
            <SitterLocationMap
              v-if="profile.latitude !== null && profile.longitude !== null"
              :latitude="profile.latitude"
              :longitude="profile.longitude"
              :label="profile.displayName"
            />
            <div v-else class="map-unavailable">Approximate location is not available for this sitter.</div>
          </section>

          <section class="reviews-section">
            <div class="reviews-heading">
              <div class="rating-badge">
                <strong>{{ profile.ratingAvg.toFixed(1) }}</strong>
                <span>out of 5</span>
              </div>
              <div>
                <p class="stars" :aria-label="`${starCount} stars`">{{ '★'.repeat(starCount) }}<span>{{ '★'.repeat(5 - starCount) }}</span></p>
                <h2>Ratings & Reviews</h2>
                <p>{{ profile.reviewCount }} verified review{{ profile.reviewCount === 1 ? '' : 's' }}</p>
              </div>
            </div>

            <div v-if="reviews.length" class="review-list">
              <article v-for="review in reviews" :key="review.id" class="review-item">
                <img :src="review.ownerAvatarUrl || '/icon/user.svg'" alt="" />
                <div>
                  <div class="review-title">
                    <strong>{{ review.ownerName || 'Pet owner' }}</strong>
                    <time :datetime="review.createdAt">{{ reviewDate(review.createdAt) }}</time>
                  </div>
                  <p class="review-stars">{{ '★'.repeat(review.rating) }}</p>
                  <p>{{ review.comment || 'A wonderful experience with this pet sitter.' }}</p>
                </div>
              </article>
            </div>
            <div v-else class="no-reviews">No written reviews yet. Be the first after booking becomes available.</div>
          </section>
        </article>

        <aside class="booking-column">
          <div class="booking-card">
            <div class="booking-card-main">
              <img class="booking-avatar" :src="profile.avatarUrl || '/navbar/profile.png'" :alt="profile.ownerName || profile.displayName" />
              <h2>{{ profile.displayName }}</h2>
              <p class="booking-owner">
                {{ profile.ownerName || 'Verified sitter' }}
                <strong>{{ experienceLabel }}</strong>
              </p>
              <div class="booking-stars" :aria-label="`${starCount} stars`" role="img">
                <svg
                  v-for="star in 5"
                  :key="star"
                  :class="{ 'is-empty': star > starCount }"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  />
                </svg>
              </div>
              <p class="booking-address"><img src="/icon/map-pin.svg" alt="" />{{ fullAddress || 'Location not specified' }}</p>
              <div class="pet-tags booking-tags">
                <span v-for="pet in profile.petTypes" :key="pet" :class="petTypeClass(pet)">{{ pet }}</span>
              </div>
            </div>
            <div class="booking-actions">
              <button class="message-button" type="button" disabled>Send Message</button>
              <button class="book-button" type="button" @click="handleBookNow">Book Now</button>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <main v-else class="profile-main not-found-page">
      <div class="not-found-card">
        <h1>Something went wrong</h1>
        <p>{{ notice }}</p>
        <RouterLink to="/search">Back to Search</RouterLink>
      </div>
    </main>

    <!-- Booking Calendar Popup Modal -->
    <BookingCalendarModal
      :open="isBookingCalendarOpen"
      :as-modal="true"
      :has-backdrop="true"
      @close="isBookingCalendarOpen = false"
      @continue="handleCalendarContinue"
    />

    <Footer />
  </div>
</template>

<style scoped>
.public-profile-page { min-height: 100vh; background: #f8f8fa; color: #292a36; }
.profile-main { width: min(100% - 40px, 1120px); min-height: 720px; margin: 0 auto; padding: 34px 0 96px; }
.back-link { display: inline-flex; margin-bottom: 18px; color: #727789; font-size: 11px; font-weight: 650; text-decoration: none; }
.back-link:hover { color: #ff6525; }
.gallery { height: 360px; display: grid; grid-template-columns: 1.6fr 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; overflow: hidden; border-radius: 22px; background: #eceef2; }
.gallery img { width: 100%; height: 100%; object-fit: cover; transition: transform 250ms ease; }
.gallery img:hover { transform: scale(1.02); }
.gallery-hero { grid-row: 1 / 3; }
.gallery-tile:last-child { grid-column: 3; grid-row: 1 / 3; }
.profile-layout { margin-top: 38px; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 62px; align-items: start; }
.profile-content { min-width: 0; }
.profile-eyebrow { margin: 0 0 7px; color: #ff6525; font-size: 10px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
.profile-heading h1 { margin: 0; color: #15171e; font-size: clamp(30px, 4vw, 44px); font-weight: 780; letter-spacing: -.045em; }
.heading-meta { margin-top: 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; color: #7d8293; font-size: 11px; }
.heading-meta span { display: inline-flex; align-items: center; gap: 4px; }
.heading-meta img { width: 13px; height: 13px; opacity: .65; }
.heading-meta .rating { color: #20232d; }
.heading-meta .rating strong { color: #15aa72; }
.pet-tags { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 7px; }
.pet-tags span { padding: 5px 11px; border: 1px solid; border-radius: 14px; font-size: 9px; }
.tag-dog { border-color: #83e1bb; background: #effcf6; color: #15a76f; }
.tag-cat { border-color: #f6abc9; background: #fff0f6; color: #d96391; }
.tag-bird { border-color: #a7dcf7; background: #eef9ff; color: #4ba7d9; }
.tag-rabbit { border-color: #ffbda3; background: #fff3ed; color: #e9693e; }
.copy-section { padding: 34px 0; border-bottom: 1px solid #e5e7ed; }
.copy-section h2, .reviews-section h2 { margin: 0; color: #242631; font-size: 18px; font-weight: 750; }
.copy-section > p { margin: 13px 0 0; color: #626779; font-size: 12px; line-height: 1.9; white-space: pre-line; }
.location-section { padding-bottom: 38px; }
.section-title-row { margin-bottom: 16px; display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.section-title-row p { margin: 6px 0 0; color: #989cad; font-size: 10px; }
.section-title-row > img { width: 21px; opacity: .55; }
.map-unavailable { height: 190px; display: grid; place-items: center; border-radius: 20px; background: #eceef2; color: #8f94a5; font-size: 11px; }
.reviews-section { padding-top: 38px; }
.reviews-heading { display: flex; align-items: center; gap: 17px; }
.rating-badge { width: 74px; height: 74px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 50%; background: #171920; color: white; }
.rating-badge strong { font-size: 22px; line-height: 1; }
.rating-badge span { margin-top: 5px; color: #b8bbc5; font-size: 8px; }
.stars { margin: 0 0 5px; color: #1ccd83; font-size: 11px; letter-spacing: 2px; }
.stars span { color: #dfe2e8; }
.reviews-heading h2 { font-size: 16px; }
.reviews-heading > div:last-child > p:last-child { margin: 5px 0 0; color: #989cad; font-size: 9px; }
.review-list { margin-top: 28px; }
.review-item { padding: 22px 0; display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 13px; border-top: 1px solid #e6e8ed; }
.review-item > img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
.review-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.review-title strong { font-size: 11px; }
.review-title time { color: #a0a4b2; font-size: 8px; }
.review-stars { margin: 5px 0 6px; color: #1ccd83 !important; font-size: 9px !important; letter-spacing: 1px; }
.review-item p { margin: 0; color: #6b7081; font-size: 10px; line-height: 1.7; }
.no-reviews { margin-top: 28px; padding: 25px; border-radius: 16px; background: #fff; color: #8d92a3; font-size: 11px; text-align: center; }
.booking-column { position: sticky; top: 100px; }
.booking-card { overflow: hidden; border: 1px solid #e7e8ed; border-radius: 17px; background: #fff; box-shadow: 0 16px 38px -27px rgb(31 34 45 / 38%); }
.booking-card-main { padding: 30px 24px 27px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.booking-avatar { width: 116px; height: 116px; border-radius: 50%; object-fit: cover; }
.booking-card h2 { margin: 21px 0 0; color: #14161d; font-size: 22px; font-weight: 800; letter-spacing: -.035em; line-height: 1.1; }
.booking-owner { margin: 7px 0 0; color: #30333e; font-size: 11px; font-weight: 650; }
.booking-owner strong { margin-left: 3px; color: #1ccd83; font-size: 10px; font-weight: 700; }
.booking-stars { display: inline-flex; align-items: center; gap: 2px; margin: 13px 0 0; color: #1ccd83; }
.booking-stars svg { width: 16px; height: 16px; fill: currentColor; }
.booking-stars svg.is-empty { color: #e2e5e9; }
.booking-address { max-width: 230px; margin: 17px 0 0; display: flex; align-items: flex-start; justify-content: center; gap: 5px; color: #8c91a2; font-size: 9px; line-height: 1.45; }
.booking-address img { width: 12px; height: 12px; flex: 0 0 auto; opacity: .55; }
.booking-tags { justify-content: center; margin-top: 15px; }
.booking-actions { padding: 14px 17px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid #eceef2; }
.booking-actions button { height: 36px; margin: 0; border: 0; border-radius: 20px; font-size: 9px; font-weight: 750; cursor: not-allowed; opacity: 1; }
.message-button { background: #fff0ea; color: #ff6525; }
.book-button { background: #ff6525; color: #fff; box-shadow: 0 7px 16px -9px #ff6525; }
.not-found-page { display: grid; place-items: center; }
.not-found-card { width: min(100%, 460px); padding: 55px 32px; border-radius: 24px; background: white; box-shadow: 0 22px 55px -38px rgb(31 34 45 / 35%); text-align: center; }
.not-found-icon { color: #ff6525; font-size: 48px; font-weight: 800; }
.not-found-card h1 { margin: 10px 0 0; font-size: 24px; }
.not-found-card p { margin: 10px 0 24px; color: #858a9b; font-size: 12px; }
.not-found-card a { display: inline-flex; padding: 10px 20px; border-radius: 22px; background: #ff6525; color: white; font-size: 11px; font-weight: 700; text-decoration: none; }
.skeleton { position: relative; overflow: hidden; background: #e8eaf0; }
.skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 25%, rgb(255 255 255 / 65%) 50%, transparent 75%); transform: translateX(-100%); animation: shimmer 1.4s infinite; }
.gallery-skeleton { height: 360px; border-radius: 22px; }
.profile-loading-grid { margin-top: 38px; display: grid; grid-template-columns: 1fr 300px; gap: 62px; }
.heading-skeleton { width: 55%; height: 50px; margin-bottom: 30px; border-radius: 12px; }
.line-skeleton { height: 110px; margin-top: 15px; border-radius: 15px; }
.booking-skeleton { height: 290px; border-radius: 20px; }
@keyframes shimmer { to { transform: translateX(100%); } }

@media (max-width: 820px) {
  .profile-main { width: min(100% - 28px, 720px); padding-bottom: 70px; }
  .gallery { height: 300px; grid-template-columns: 1.5fr 1fr; }
  .gallery-tile:last-child { display: none; }
  .profile-layout, .profile-loading-grid { grid-template-columns: 1fr; gap: 30px; }
  .booking-column { position: static; grid-row: 1; }
  .booking-card { max-width: none; }
}

@media (max-width: 520px) {
  .profile-main { padding-top: 22px; }
  .gallery { height: 250px; grid-template-columns: 1fr 1fr; }
  .gallery-hero { grid-column: 1 / 3; grid-row: 1; }
  .gallery-tile { grid-row: 2; }
  .gallery-tile:nth-of-type(n+4) { display: none; }
  .profile-layout { margin-top: 26px; }
  .heading-meta { align-items: flex-start; flex-direction: column; gap: 7px; }
  .copy-section { padding: 27px 0; }
}
</style>
