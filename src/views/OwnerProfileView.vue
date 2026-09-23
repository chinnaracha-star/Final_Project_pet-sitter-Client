<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Navbar } from '../components'
import OwnerPageShell from '../components/owner/OwnerPageShell.vue'
import { uploadOwnerMedia } from '../services/ownerApi'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const photoInput = ref<HTMLInputElement | null>(null)
const photoFile = ref<File | null>(null)
const notice = ref('')
const error = ref('')
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dobInput = ref<HTMLInputElement | null>(null)

function groupDigits(value: string, groups: number[]) {
  const digits = value.replace(/\D/g, '').slice(0, groups.reduce((sum, size) => sum + size, 0))
  const parts: string[] = []
  let index = 0
  for (const size of groups) {
    if (index >= digits.length) break
    parts.push(digits.slice(index, index + size))
    index += size
  }
  return parts.join(' ')
}

const form = reactive({
  name: auth.profile.name,
  email: auth.profile.email,
  phone: groupDigits(auth.profile.phone, [3, 3, 4]),
  idNumber: groupDigits(auth.profile.idNumber, [4, 2, 3, 4]),
  dateOfBirth: auth.profile.dateOfBirth,
  avatarUrl: auth.profile.avatarUrl,
})

const formattedDob = computed(() => {
  if (!form.dateOfBirth) return ''
  const date = new Date(`${form.dateOfBirth}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
})

function openDob() {
  const input = dobInput.value
  if (!input) return
  if (typeof input.showPicker === 'function') input.showPicker()
  else input.focus()
}

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

    <form @submit.prevent="save">
      <div class="relative mb-8 w-[140px]">
        <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="" class="size-[140px] rounded-full object-cover bg-[#e4e7f2]" />
        <div v-else class="grid size-[140px] place-items-center rounded-full bg-[#e4e7f2] text-4xl text-primary-300">
          <img src="/icon/user.svg" alt="" class="size-12" />
        </div>
        <button
          type="button"
          class="absolute right-1 bottom-1 grid size-9 place-items-center rounded-full bg-orange-100 text-xl text-orange-700"
          aria-label="Change profile photo"
          @click="photoInput?.click()"
        >
          +
        </button>
        <input ref="photoInput" class="sr-only" type="file" accept="image/*" @change="onPhoto" />
      </div>

      <label class="auth-label" for="owner-name">Your Name*</label>
      <input id="owner-name" v-model.trim="form.name" class="auth-input rounded-lg!" autocomplete="name" required />

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="auth-label" for="owner-email">Email*</label>
          <input id="owner-email" :value="form.email" class="auth-input rounded-lg! bg-primary-100/50" type="email" disabled />
        </div>
        <div>
          <label class="auth-label" for="owner-phone">Phone*</label>
          <input
            id="owner-phone"
            :value="form.phone"
            class="auth-input rounded-lg!"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            placeholder="099 996 6734"
            required
            @input="form.phone = groupDigits(($event.target as HTMLInputElement).value, [3, 3, 4])"
          />
        </div>
        <div>
          <label class="auth-label" for="owner-id">ID Number</label>
          <input
            id="owner-id"
            :value="form.idNumber"
            class="auth-input rounded-lg!"
            inputmode="numeric"
            placeholder="1122 21 236 8654"
            @input="form.idNumber = groupDigits(($event.target as HTMLInputElement).value, [4, 2, 3, 4])"
          />
        </div>
        <div>
          <label class="auth-label" for="owner-dob">Date of Birth</label>
          <div class="relative">
            <input
              id="owner-dob"
              class="auth-input rounded-lg! pr-12"
              type="text"
              readonly
              :value="formattedDob"
              placeholder="Select your date of birth"
              @click="openDob"
            />
            <button
              type="button"
              class="absolute top-1/2 right-4 grid size-8 -translate-y-1/2 place-items-center"
              aria-label="Choose date of birth"
              @click="openDob"
            >
              <img src="/icon/calendar.svg" alt="" class="size-5" />
            </button>
            <input ref="dobInput" v-model="form.dateOfBirth" class="sr-only" type="date" tabindex="-1" />
          </div>
        </div>
      </div>

      <p class="mt-4 text-sm text-primary-500">ID number and date of birth are required before you can book a sitter.</p>

      <div class="mt-8 flex justify-end">
        <button class="auth-submit w-auto px-8 whitespace-nowrap" type="submit">Update Profile</button>
      </div>
      <p v-if="error" class="auth-notice text-red" role="alert">{{ error }}</p>
      <p v-else-if="notice" class="auth-notice" role="status">{{ notice }}</p>
    </form>
  </OwnerPageShell>
</template>
