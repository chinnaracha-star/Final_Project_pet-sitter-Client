<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

type ApprovalStatus = 'unverified' | 'waiting' | 'approved' | 'rejected'
type GalleryImage = { name: string; url: string }

const route = useRoute()
const initialStatus = route.query.status
const status = ref<ApprovalStatus>(
  initialStatus === 'waiting' || initialStatus === 'approved' || initialStatus === 'rejected'
    ? initialStatus
    : 'unverified',
)
const statusText = computed(() => ({
  unverified: 'Unverified',
  waiting: 'Waiting for approval',
  approved: 'Approved',
  rejected: 'Rejected',
})[status.value])
const statusClass = computed(() => ({
  unverified: 'text-[#ec6d85]',
  waiting: 'text-[#ec6d85]',
  approved: 'text-[#16a86f]',
  rejected: 'text-[#e34b4b]',
})[status.value])

const fullName = ref('')
const phone = ref('')
const email = ref('')
const experience = ref('')
const dateOfBirth = ref('')
const idNumber = ref('')
const introduction = ref('')
const sitterName = ref('')
const petTypes = ref<string[]>([])
const services = ref('')
const myPlace = ref('')
const address = ref('')
const district = ref('')
const subDistrict = ref('')
const province = ref('')
const postCode = ref('')
const images = ref<GalleryImage[]>([])
const avatarUrl = ref('')
const imageError = ref('')
const notice = ref('')
const photoInput = ref<HTMLInputElement | null>(null)

function addImages(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files ?? [])
  if (images.value.length + selected.length > 10) {
    imageError.value = 'Uploadได้สูงสุด 10 รูป'
    input.value = ''
    return
  }
  imageError.value = ''
  images.value.push(...selected.map(file => ({ name: file.name, url: URL.createObjectURL(file) })))
  input.value = ''
}

function removeImage(index: number) {
  const removed = images.value.splice(index, 1)[0]
  if (removed) URL.revokeObjectURL(removed.url)
  imageError.value = ''
}

function changeAvatar(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (avatarUrl.value) URL.revokeObjectURL(avatarUrl.value)
  avatarUrl.value = URL.createObjectURL(file)
}

onUnmounted(() => {
  images.value.forEach(image => URL.revokeObjectURL(image.url))
  if (avatarUrl.value) URL.revokeObjectURL(avatarUrl.value)
})

function submitProfile() {
  if (petTypes.value.length === 0) {
    notice.value = 'เลือก Pet type อย่างน้อย 1 ประเภท'
    return
  }
  notice.value = 'ตรวจข้อมูลฝั่งหน้าเว็บแล้ว แต่ยังไม่ได้บันทึกหรือส่งให้ Admin จนกว่าจะเชื่อม API ของ Spring Boot'
}
</script>

<template>
  <div class="flex min-h-svh bg-[#f6f7fb]">
    <aside class="flex w-[72px] shrink-0 flex-col border-r border-primary-100 bg-white min-[761px]:w-[250px]">
      <div class="px-2 py-[22px] text-[19px] font-extrabold text-primary-900 min-[761px]:px-6 min-[761px]:py-8 min-[761px]:text-[34px]">
        S<span class="italic text-orange-700">i</span>tter<strong class="align-top text-[10px] text-[#16bd80] min-[761px]:text-lg">✦</strong>
      </div>
      <nav class="mt-[18px] flex flex-col gap-[7px]" aria-label="Sitter menu">
        <RouterLink
          class="flex min-h-[52px] items-center justify-center gap-3.5 bg-orange-100 px-2.5 text-base text-orange-700 no-underline min-[761px]:justify-start min-[761px]:px-[22px]"
          to="/sitter/profile"
        >
          ♙ <span class="max-[760px]:hidden">Pet Sitter Profile</span>
        </RouterLink>
        <span class="flex min-h-[52px] items-center justify-center gap-3.5 px-2.5 text-base text-[#73798a] min-[761px]:justify-start min-[761px]:px-[22px]">
          ☷ <span class="max-[760px]:hidden">Booking List</span>
        </span>
        <span class="flex min-h-[52px] items-center justify-center gap-3.5 px-2.5 text-base text-[#73798a] min-[761px]:justify-start min-[761px]:px-[22px]">
          ▣ <span class="max-[760px]:hidden">Calendar</span>
        </span>
        <span class="flex min-h-[52px] items-center justify-center gap-3.5 px-2.5 text-base text-[#73798a] min-[761px]:justify-start min-[761px]:px-[22px]">
          ▤ <span class="max-[760px]:hidden">Payout Option</span>
        </span>
      </nav>
      <RouterLink
        class="mt-auto flex min-h-[52px] items-center justify-center gap-3.5 border-t border-primary-100 px-2.5 text-base text-[#73798a] no-underline min-[761px]:justify-start min-[761px]:px-[22px]"
        :to="{ path: '/login', query: { role: 'sitter' } }"
      >
        ↪ <span class="max-[760px]:hidden">Back to Login</span>
      </RouterLink>
    </aside>

    <div class="min-w-0 flex-1">
      <header class="flex h-[78px] items-center gap-3.5 border-b border-primary-100 bg-white px-5 min-[761px]:px-9">
        <span class="grid size-10 place-items-center rounded-full bg-[#e7e9f6] text-2xl text-white">♙</span>
        <span>{{ fullName || 'Pet Sitter' }}</span>
      </header>

      <main class="mx-auto mb-[60px] mt-8 w-[min(100%-28px,1120px)] min-[761px]:w-[min(100%-56px,1120px)]">
        <div class="mb-5 flex flex-col items-start justify-between gap-4 min-[761px]:flex-row min-[761px]:items-center">
          <div class="flex flex-wrap items-center gap-4">
            <h1 class="m-0 text-[26px]">Pet Sitter Profile</h1>
            <span class="text-sm" :class="statusClass">{{ statusText }}</span>
          </div>
          <button type="submit" form="profile-form" class="rounded-3xl border-0 bg-orange-700 px-5 py-3 font-bold text-white">
            {{ status === 'unverified' || status === 'rejected' ? 'Request for approval' : 'Update Profile' }}
          </button>
        </div>

        <p v-if="status === 'rejected'" class="mb-4 rounded-md bg-[#e8ebf8] px-[18px] py-3.5 text-[#dc4451]" role="status">
          Your request has not been approved. Please revise your information and request approval again.
        </p>
        <p v-if="status === 'waiting'" class="mb-4 rounded-md bg-[#e8ebf8] px-[18px] py-3.5 text-[#626a7c]" role="status">
          Your profile is waiting for Admin approval.
        </p>
        <p v-if="status === 'approved'" class="mb-4 rounded-md bg-[#eaf8f0] px-[18px] py-3.5 text-[#168e62]">
          Your sitter profile is listed. New edits will need approval before they appear publicly.
        </p>
        <p v-if="notice" class="mb-4 rounded-md bg-orange-100 px-[18px] py-3.5 text-primary-700" role="status">{{ notice }}</p>

        <form id="profile-form" @submit.prevent="submitProfile">
          <section class="mb-5 rounded-xl bg-white p-[22px] min-[761px]:p-[34px]">
            <h2 class="mb-[26px] text-xl text-[#9299ad]">Basic Information</h2>
            <label class="mb-[15px] block font-semibold text-primary-900">Profile Image</label>
            <div class="relative mb-7 w-[210px]">
              <div class="grid size-[210px] place-items-center overflow-hidden rounded-full bg-[#e7e9f6]" aria-label="Profile image">
                <img v-if="avatarUrl" class="size-full object-cover" :src="avatarUrl" alt="Selected profile" />
                <svg v-else class="w-[90px] fill-none stroke-white stroke-[6] [stroke-linecap:round]" viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="35" r="16" />
                  <path d="M22 82c0-17 12-28 28-28s28 11 28 28" />
                </svg>
              </div>
              <button
                type="button"
                class="absolute right-0 bottom-0 size-[52px] rounded-full border-0 bg-orange-100 text-[30px] text-orange-700"
                aria-label="Choose profile image"
                @click="photoInput?.click()"
              >
                ＋
              </button>
              <input ref="photoInput" class="sr-only" type="file" accept="image/*" aria-label="Profile image" @change="changeAvatar" />
            </div>
            <div class="grid grid-cols-1 gap-x-7 gap-y-[22px] min-[761px]:grid-cols-2">
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="full-name">Your full name <b class="text-red">*</b></label>
                <input id="full-name" v-model.trim="fullName" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" autocomplete="name" required />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="experience">Experience <b class="text-red">*</b></label>
                <select id="experience" v-model="experience" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" required>
                  <option value="" disabled>Select experience</option>
                  <option>0–1 year</option>
                  <option>1–3 years</option>
                  <option>3–5 years</option>
                  <option>5+ years</option>
                </select>
              </div>
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="phone">Phone Number <b class="text-red">*</b></label>
                <input id="phone" v-model.trim="phone" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" type="tel" autocomplete="tel" required />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="email">Email <b class="text-red">*</b></label>
                <input id="email" v-model.trim="email" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" type="email" autocomplete="email" required />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="dob">Date of Birth <b class="text-red">*</b></label>
                <input id="dob" v-model="dateOfBirth" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" type="date" required />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="id-number">ID Number <b class="text-red">*</b></label>
                <input id="id-number" v-model.trim="idNumber" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" inputmode="numeric" required />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px] min-[761px]:col-span-2">
                <label class="text-[15px] font-semibold text-primary-900" for="intro">Introduction (Describe about yourself as pet sitter)</label>
                <textarea id="intro" v-model.trim="introduction" class="min-h-12 w-full resize-y rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" rows="5" />
              </div>
            </div>
          </section>

          <section class="mb-5 rounded-xl bg-white p-[22px] min-[761px]:p-[34px]">
            <h2 class="mb-[26px] text-xl text-[#9299ad]">Pet Sitter</h2>
            <div class="grid grid-cols-1 gap-x-7 gap-y-[22px] min-[761px]:grid-cols-2">
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="sitter-name">Pet sitter name (Trade Name) <b class="text-red">*</b></label>
                <input id="sitter-name" v-model.trim="sitterName" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" required />
              </div>
              <fieldset class="flex min-w-0 flex-row flex-wrap gap-[18px] border-0 p-0 min-[761px]:col-span-2">
                <legend class="mb-[9px] text-[15px] font-semibold text-primary-900">Pet type <b class="text-red">*</b></legend>
                <label v-for="pet in ['Dog', 'Cat', 'Bird', 'Rabbit']" :key="pet" class="inline-flex items-center gap-1.5">
                  <input v-model="petTypes" type="checkbox" :value="pet" />{{ pet }}
                </label>
              </fieldset>
              <div class="flex min-w-0 flex-col gap-[9px] min-[761px]:col-span-2">
                <label class="text-[15px] font-semibold text-primary-900" for="services">Services (Describe your service for pet sitting)</label>
                <textarea id="services" v-model.trim="services" class="min-h-12 w-full resize-y rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" rows="4" />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px] min-[761px]:col-span-2">
                <label class="text-[15px] font-semibold text-primary-900" for="my-place">My Place (Describe your place)</label>
                <textarea id="my-place" v-model.trim="myPlace" class="min-h-12 w-full resize-y rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" rows="4" />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px] min-[761px]:col-span-2">
                <label class="text-[15px] font-semibold text-primary-900">Image Gallery (Maximum 10 images)</label>
                <div class="flex flex-wrap gap-2.5">
                  <div v-for="(image, index) in images" :key="image.url" class="relative h-[100px] w-[108px] overflow-hidden rounded">
                    <img class="size-full object-cover" :src="image.url" :alt="image.name" />
                    <button
                      type="button"
                      class="absolute top-[3px] right-[3px] size-[23px] rounded-full border-0 bg-[#444b60] text-white"
                      :aria-label="`Remove ${image.name}`"
                      @click="removeImage(index)"
                    >
                      ×
                    </button>
                  </div>
                  <label class="flex h-[100px] w-[108px] cursor-pointer flex-col items-center justify-center gap-1 bg-orange-100 text-[28px] text-orange-700">
                    ⊕<span class="text-xs">Upload Image</span>
                    <input type="file" accept="image/*" multiple class="sr-only" @change="addImages" />
                  </label>
                </div>
                <small v-if="imageError" class="text-[#d43a3a]" role="alert">{{ imageError }}</small>
              </div>
            </div>
          </section>

          <section class="mb-5 rounded-xl bg-white p-[22px] min-[761px]:p-[34px]">
            <h2 class="mb-[26px] text-xl text-[#9299ad]">Address</h2>
            <div class="grid grid-cols-1 gap-x-7 gap-y-[22px] min-[761px]:grid-cols-2">
              <div class="flex min-w-0 flex-col gap-[9px] min-[761px]:col-span-2">
                <label class="text-[15px] font-semibold text-primary-900" for="address">Address detail <b class="text-red">*</b></label>
                <input id="address" v-model.trim="address" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" required />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="district">District <b class="text-red">*</b></label>
                <input id="district" v-model.trim="district" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" required />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="sub-district">Sub-district <b class="text-red">*</b></label>
                <input id="sub-district" v-model.trim="subDistrict" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" required />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="province">Province <b class="text-red">*</b></label>
                <input id="province" v-model.trim="province" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" required />
              </div>
              <div class="flex min-w-0 flex-col gap-[9px]">
                <label class="text-[15px] font-semibold text-primary-900" for="post-code">Post code <b class="text-red">*</b></label>
                <input id="post-code" v-model.trim="postCode" class="min-h-12 w-full rounded-md border border-primary-100 bg-white px-3.5 py-3 text-slate-700" inputmode="numeric" required />
              </div>
            </div>
            <div class="mt-[22px] grid min-h-[220px] place-items-center rounded-lg border border-dashed border-[#cdd5e5] bg-[#f2f5f8] p-5 text-center text-[#777f90]">
              Map preview will be available after connecting a location service.
            </div>
          </section>

          <div class="flex justify-end">
            <button type="submit" class="rounded-3xl border-0 bg-orange-700 px-5 py-3 font-bold text-white">Update Profile</button>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>
