<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Navbar } from '../components'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import { uploadOwnerMedia } from '../services/ownerApi'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const photoInput = ref<HTMLInputElement | null>(null)
const photoFile = ref<File | null>(null)
const notice = ref('')
const error = ref('')
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
  photoFile.value = file
  form.avatarUrl = URL.createObjectURL(file)
}

async function save() {
  notice.value = ''
  error.value = ''
  try {
    let avatarUrl = form.avatarUrl.startsWith('blob:') ? auth.profile.avatarUrl : form.avatarUrl
    if (photoFile.value) {
      avatarUrl = (await uploadOwnerMedia(photoFile.value, 'profile')).url
    }
    await auth.updateOwnerProfile({
      name: form.name,
      phone: form.phone,
      idNumber: form.idNumber,
      dateOfBirth: form.dateOfBirth,
      avatarUrl,
    })
    form.avatarUrl = auth.profile.avatarUrl
    photoFile.value = null
    notice.value = 'Profile updated.'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not update profile'
  }
}
</script>

<template>
  <OwnerPageShell title="Profile">
    <template #nav>
      <Navbar />
    </template>

    <form class="max-w-[640px]" @submit.prevent="save">
      <div class="relative mb-8 w-[180px]">
        <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="" class="size-[180px] rounded-full object-cover bg-primary-100" />
        <div v-else class="grid size-[180px] place-items-center rounded-full bg-primary-100 text-primary-300">+</div>
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

      <p class="mt-4 text-sm text-primary-500">ID number and date of birth are required before you can book a sitter.</p>

      <div class="mt-8 flex justify-end">
        <button class="auth-submit max-w-48" type="submit">Update Profile</button>
      </div>
      <p v-if="error" class="auth-notice text-red" role="alert">{{ error }}</p>
      <p v-else-if="notice" class="auth-notice" role="status">{{ notice }}</p>
    </form>
  </OwnerPageShell>
</template>
