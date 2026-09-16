<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Navbar } from '../components'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const photoInput = ref<HTMLInputElement | null>(null)
const notice = ref('')
const form = reactive({
  name: auth.profile.name,
  email: auth.profile.email,
  phone: auth.profile.phone,
  idNumber: auth.profile.idNumber,
  dateOfBirth: auth.profile.dateOfBirth,
  avatarUrl: auth.profile.avatarUrl,
})

function onPhoto(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  form.avatarUrl = URL.createObjectURL(file)
}

function save() {
  auth.updateOwnerProfile({
    name: form.name,
    phone: form.phone,
    idNumber: form.idNumber,
    dateOfBirth: form.dateOfBirth,
    avatarUrl: form.avatarUrl,
  })
  notice.value = 'Profile updated in this mock session. Saving to Spring Boot will come later.'
}
</script>

<template>
  <OwnerPageShell title="Profile">
    <template #nav>
      <Navbar />
    </template>

    <form class="max-w-[640px]" @submit.prevent="save">
      <div class="relative mb-8 w-[180px]">
        <img :src="form.avatarUrl" alt="" class="size-[180px] rounded-full object-cover bg-primary-100" />
        <button
          type="button"
          class="absolute right-1 bottom-1 grid size-10 place-items-center rounded-full bg-orange-100"
          aria-label="Change profile photo"
          @click="photoInput?.click()"
        >
          <img src="/icon/camera.svg" alt="" class="size-5" />
        </button>
        <input ref="photoInput" class="sr-only" type="file" accept="image/*" @change="onPhoto" />
      </div>

      <label class="auth-label" for="owner-name">Your Name*</label>
      <input id="owner-name" v-model.trim="form.name" class="auth-input" autocomplete="name" required />

      <label class="auth-label" for="owner-email">Email*</label>
      <input id="owner-email" :value="form.email" class="auth-input bg-primary-100/50" type="email" disabled />

      <label class="auth-label" for="owner-phone">Phone*</label>
      <input id="owner-phone" v-model.trim="form.phone" class="auth-input" type="tel" autocomplete="tel" required />

      <label class="auth-label" for="owner-id">ID Number</label>
      <input id="owner-id" v-model.trim="form.idNumber" class="auth-input" />

      <label class="auth-label" for="owner-dob">Date of Birth</label>
      <input id="owner-dob" v-model="form.dateOfBirth" class="auth-input" type="date" />

      <div class="mt-8 flex justify-end">
        <button class="auth-submit max-w-48" type="submit">Update Profile</button>
      </div>
      <p v-if="notice" class="auth-notice" role="status">{{ notice }}</p>
    </form>
  </OwnerPageShell>
</template>
