<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

type ApprovalStatus = 'unverified' | 'waiting' | 'approved' | 'rejected'
type GalleryImage = { name: string; url: string }

const route = useRoute()
const initialStatus = route.query.status
const status = ref<ApprovalStatus>(
  initialStatus === 'waiting' || initialStatus === 'approved' || initialStatus === 'rejected'
    ? initialStatus : 'unverified',
)
const statusText = computed(() => ({
  unverified: 'Unverified', waiting: 'Waiting for approval', approved: 'Approved', rejected: 'Rejected',
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
  <div class="profile-shell">
    <aside class="sidebar">
      <div class="brand">S<span>i</span>tter<strong>✦</strong></div>
      <nav aria-label="Sitter menu">
        <RouterLink class="active" to="/sitter/profile">♙ <span>Pet Sitter Profile</span></RouterLink>
        <span>☷ <span>Booking List</span></span>
        <span>▣ <span>Calendar</span></span>
        <span>▤ <span>Payout Option</span></span>
      </nav>
      <RouterLink class="logout" to="/login">↪ <span>Back to Login</span></RouterLink>
    </aside>

    <div class="main-column">
      <header class="topbar"><span class="small-avatar">♙</span><span>{{ fullName || 'Pet Sitter' }}</span></header>
      <main class="profile-content">
        <div class="page-heading">
          <div><h1>Pet Sitter Profile</h1><span class="status" :class="status">{{ statusText }}</span></div>
          <button type="submit" form="profile-form" class="approval-button">{{ status === 'unverified' || status === 'rejected' ? 'Request for approval' : 'Update Profile' }}</button>
        </div>
        <p v-if="status === 'rejected'" class="rejection" role="status">Your request has not been approved. Please revise your information and request approval again.</p>
        <p v-if="status === 'waiting'" class="pending" role="status">Your profile is waiting for Admin approval.</p>
        <p v-if="status === 'approved'" class="approved-note">Your sitter profile is listed. New edits will need approval before they appear publicly.</p>
        <p v-if="notice" class="demo-notice" role="status">{{ notice }}</p>

        <form id="profile-form" @submit.prevent="submitProfile">
          <section class="card">
            <h2>Basic Information</h2>
            <label class="image-label">Profile Image</label>
            <div class="avatar-picker">
              <div class="avatar-placeholder" aria-label="Profile image"><img v-if="avatarUrl" :src="avatarUrl" alt="Selected profile" /><svg v-else viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="35" r="16"/><path d="M22 82c0-17 12-28 28-28s28 11 28 28"/></svg></div>
              <button type="button" class="add-avatar" aria-label="Choose profile image" @click="photoInput?.click()">＋</button>
              <input ref="photoInput" class="visually-hidden" type="file" accept="image/*" aria-label="Profile image" @change="changeAvatar" />
            </div>
            <div class="fields">
              <div class="field"><label for="full-name">Your full name <b>*</b></label><input id="full-name" v-model.trim="fullName" autocomplete="name" required /></div>
              <div class="field"><label for="experience">Experience <b>*</b></label><select id="experience" v-model="experience" required><option value="" disabled>Select experience</option><option>0–1 year</option><option>1–3 years</option><option>3–5 years</option><option>5+ years</option></select></div>
              <div class="field"><label for="phone">Phone Number <b>*</b></label><input id="phone" v-model.trim="phone" type="tel" autocomplete="tel" required /></div>
              <div class="field"><label for="email">Email <b>*</b></label><input id="email" v-model.trim="email" type="email" autocomplete="email" required /></div>
              <div class="field"><label for="dob">Date of Birth <b>*</b></label><input id="dob" v-model="dateOfBirth" type="date" required /></div>
              <div class="field"><label for="id-number">ID Number <b>*</b></label><input id="id-number" v-model.trim="idNumber" inputmode="numeric" required /></div>
              <div class="field wide"><label for="intro">Introduction (Describe about yourself as pet sitter)</label><textarea id="intro" v-model.trim="introduction" rows="5" /></div>
            </div>
          </section>

          <section class="card">
            <h2>Pet Sitter</h2>
            <div class="fields">
              <div class="field"><label for="sitter-name">Pet sitter name (Trade Name) <b>*</b></label><input id="sitter-name" v-model.trim="sitterName" required /></div>
              <fieldset class="field wide pet-types"><legend>Pet type <b>*</b></legend><label v-for="pet in ['Dog', 'Cat', 'Bird', 'Rabbit']" :key="pet"><input v-model="petTypes" type="checkbox" :value="pet" />{{ pet }}</label></fieldset>
              <div class="field wide"><label for="services">Services (Describe your service for pet sitting)</label><textarea id="services" v-model.trim="services" rows="4" /></div>
              <div class="field wide"><label for="my-place">My Place (Describe your place)</label><textarea id="my-place" v-model.trim="myPlace" rows="4" /></div>
              <div class="field wide"><label>Image Gallery (Maximum 10 images)</label><div class="gallery"><div v-for="(image, index) in images" :key="image.url" class="gallery-image"><img :src="image.url" :alt="image.name" /><button type="button" :aria-label="`Remove ${image.name}`" @click="removeImage(index)">×</button></div><label class="upload-tile">⊕<span>Upload Image</span><input type="file" accept="image/*" multiple class="visually-hidden" @change="addImages" /></label></div><small v-if="imageError" class="error" role="alert">{{ imageError }}</small></div>
            </div>
          </section>

          <section class="card">
            <h2>Address</h2>
            <div class="fields">
              <div class="field wide"><label for="address">Address detail <b>*</b></label><input id="address" v-model.trim="address" required /></div>
              <div class="field"><label for="district">District <b>*</b></label><input id="district" v-model.trim="district" required /></div>
              <div class="field"><label for="sub-district">Sub-district <b>*</b></label><input id="sub-district" v-model.trim="subDistrict" required /></div>
              <div class="field"><label for="province">Province <b>*</b></label><input id="province" v-model.trim="province" required /></div>
              <div class="field"><label for="post-code">Post code <b>*</b></label><input id="post-code" v-model.trim="postCode" inputmode="numeric" required /></div>
            </div>
            <div class="map-placeholder">Map preview will be available after connecting a location service.</div>
          </section>
          <div class="form-actions"><button type="submit">Update Profile</button></div>
        </form>
      </main>
    </div>
  </div>
</template>

<style scoped>
.profile-shell { min-height: 100svh; display: flex; }.sidebar { width: 250px; flex: none; display: flex; flex-direction: column; border-right: 1px solid #e0e4f2; background: #fff; }.brand { padding: 32px 24px; color: #111; font-size: 34px; font-weight: 800; }.brand span { color: #ff713e; font-style: italic; }.brand strong { color: #16bd80; font-size: 18px; vertical-align: top; }
.sidebar nav { display: flex; flex-direction: column; gap: 7px; margin-top: 18px; }.sidebar nav > *,.logout { display: flex; gap: 14px; align-items: center; min-height: 52px; padding: 10px 22px; color: #73798a; font-size: 16px; text-decoration: none; }.sidebar nav .active { color: #ff713e; background: #fff3ee; }.logout { margin-top: auto; border-top: 1px solid #e0e4f2; }
.main-column { min-width: 0; flex: 1; }.topbar { height: 78px; display: flex; gap: 14px; align-items: center; padding: 0 36px; background: white; border-bottom: 1px solid #e0e4f2; }.small-avatar { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: #e7e9f6; color: white; font-size: 24px; }
.profile-content { width: min(100% - 56px, 1120px); margin: 32px auto 60px; }.page-heading { display: flex; gap: 16px; justify-content: space-between; align-items: center; margin-bottom: 20px; }.page-heading > div { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }h1 { margin: 0; font-size: 26px; }.status { font-size: 14px; color: #ec6d85; }.status.approved { color: #16a86f; }.status.rejected { color: #e34b4b; }.approval-button,.form-actions button { padding: 12px 20px; border: 0; border-radius: 24px; background: #ff713e; color: white; font-weight: 700; }
.rejection,.pending,.approved-note,.demo-notice { padding: 14px 18px; border-radius: 7px; background: #e8ebf8; color: #dc4451; }.pending { color: #626a7c; }.approved-note { color: #168e62; background: #eaf8f0; }.demo-notice { color: #454d5f; background: #fff1e9; }
.card { margin-bottom: 20px; padding: 34px; border-radius: 12px; background: white; }h2 { margin: 0 0 26px; color: #9299ad; font-size: 20px; }.image-label { display: block; margin-bottom: 15px; color: #222; font-weight: 600; }.avatar-picker { position: relative; width: 210px; margin-bottom: 28px; }.avatar-placeholder { display: grid; place-items: center; width: 210px; height: 210px; overflow: hidden; border-radius: 50%; background: #e7e9f6; }.avatar-placeholder img { width: 100%; height: 100%; object-fit: cover; }.avatar-placeholder svg { width: 90px; fill: none; stroke: white; stroke-width: 6; stroke-linecap: round; }.add-avatar { position: absolute; right: 0; bottom: 0; width: 52px; height: 52px; border: 0; border-radius: 50%; color: #ff713e; background: #fff2eb; font-size: 30px; }
.fields { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 22px 28px; }.field { min-width: 0; display: flex; flex-direction: column; gap: 9px; }.field.wide { grid-column: 1 / -1; }.field > label,legend { color: #222; font-size: 15px; font-weight: 600; }.field b,legend b { color: #ed3d4a; }.field input:not([type=checkbox]),.field select,.field textarea { width: 100%; min-height: 48px; padding: 12px 14px; border: 1px solid #d8ddef; border-radius: 7px; color: #30343f; background: white; }.field textarea { resize: vertical; }.pet-types { display: flex; flex-direction: row; gap: 18px; flex-wrap: wrap; padding: 0; border: 0; }.pet-types legend { margin-bottom: 9px; }.pet-types label { display: inline-flex; gap: 5px; align-items: center; }
.gallery { display: flex; gap: 10px; flex-wrap: wrap; }.gallery-image,.upload-tile { position: relative; width: 108px; height: 100px; border-radius: 5px; overflow: hidden; }.gallery-image img { width: 100%; height: 100%; object-fit: cover; }.gallery-image button { position: absolute; right: 3px; top: 3px; width: 23px; height: 23px; border: 0; border-radius: 50%; background: #444b60; color: white; }.upload-tile { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #ff713e; background: #fff2ec; font-size: 28px; cursor: pointer; }.upload-tile span { font-size: 12px; }.error { color: #d43a3a; }.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.map-placeholder { display: grid; place-items: center; min-height: 220px; margin-top: 22px; padding: 20px; border: 1px dashed #cdd5e5; border-radius: 8px; color: #777f90; background: #f2f5f8; text-align: center; }.form-actions { display: flex; justify-content: flex-end; }
@media (max-width: 760px) { .sidebar { width: 72px; }.brand { padding: 22px 8px; font-size: 19px; }.brand strong { font-size: 10px; }.sidebar nav > *,.logout { justify-content: center; padding: 10px; }.sidebar nav span,.logout span { display: none; }.topbar { padding: 0 20px; }.profile-content { width: min(100% - 28px, 1120px); }.card { padding: 22px; }.fields { grid-template-columns: 1fr; }.field.wide { grid-column: 1; }.page-heading { align-items: flex-start; flex-direction: column; } }
</style>
