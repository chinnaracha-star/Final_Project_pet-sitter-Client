<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { OwnerPet, PetSex, PetTypeName } from '../../types/owner'
import { PET_TYPES } from '../../types/owner'

const props = defineProps<{
  mode: 'create' | 'edit'
  pet?: OwnerPet
}>()

const emit = defineEmits<{
  save: [payload: Omit<OwnerPet, 'id'>, photo: File | null]
  cancel: []
  remove: []
}>()

const form = reactive({
  name: '',
  petType: 'Dog' as PetTypeName,
  breed: '',
  sex: 'Female' as PetSex,
  ageMonths: 1,
  color: '',
  weightKg: 1,
  about: '',
  avatarUrl: '',
})

const photoInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const photoFile = ref<File | null>(null)

const isCreate = computed(() => props.mode === 'create')

function fillForm() {
  if (props.pet) {
    form.name = props.pet.name
    form.petType = props.pet.petType
    form.breed = props.pet.breed
    form.sex = props.pet.sex
    form.ageMonths = props.pet.ageMonths
    form.color = props.pet.color
    form.weightKg = props.pet.weightKg
    form.about = props.pet.about
    form.avatarUrl = props.pet.avatarUrl
    previewUrl.value = props.pet.avatarUrl
    photoFile.value = null
  } else {
    form.name = ''
    form.petType = 'Dog'
    form.breed = ''
    form.sex = 'Female'
    form.ageMonths = 1
    form.color = ''
    form.weightKg = 1
    form.about = ''
    form.avatarUrl = ''
    previewUrl.value = ''
    photoFile.value = null
  }
}

watch(() => props.pet, fillForm, { immediate: true })

function onPhoto(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  previewUrl.value = URL.createObjectURL(file)
  photoFile.value = file
}

function submit() {
  emit('save', { ...form, avatarUrl: form.avatarUrl }, photoFile.value)
}
</script>

<template>
  <form class="max-w-[720px]" @submit.prevent="submit">
    <div class="relative mb-8 w-[180px]">
      <div class="grid size-[180px] place-items-center overflow-hidden rounded-full bg-primary-100">
        <img v-if="previewUrl" :src="previewUrl" alt="" class="size-full object-cover" />
        <span v-else class="text-4xl text-primary-300">+</span>
      </div>
      <button
        type="button"
        class="absolute right-1 bottom-1 grid size-10 place-items-center rounded-full bg-orange-100 text-xl text-orange-700"
        aria-label="Add pet photo"
        @click="photoInput?.click()"
      >
        +
      </button>
      <input ref="photoInput" class="sr-only" type="file" accept="image/*" @change="onPhoto" />
    </div>

    <label class="auth-label" for="pet-name">Pet Name*</label>
    <input id="pet-name" v-model.trim="form.name" class="auth-input" required />

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <div>
        <label class="auth-label" for="pet-type">Pet Type*</label>
        <select id="pet-type" v-model="form.petType" class="auth-input" required>
          <option v-for="type in PET_TYPES" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
      <div>
        <label class="auth-label" for="pet-breed">Breed*</label>
        <input id="pet-breed" v-model.trim="form.breed" class="auth-input" required />
      </div>
      <div>
        <label class="auth-label" for="pet-sex">Sex*</label>
        <select id="pet-sex" v-model="form.sex" class="auth-input" required>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </select>
      </div>
      <div>
        <label class="auth-label" for="pet-age">Age (Month)*</label>
        <input id="pet-age" v-model.number="form.ageMonths" class="auth-input" type="number" min="0" step="1" required />
      </div>
      <div>
        <label class="auth-label" for="pet-color">Color*</label>
        <input id="pet-color" v-model.trim="form.color" class="auth-input" required />
      </div>
      <div>
        <label class="auth-label" for="pet-weight">Weight (Kilogram)*</label>
        <input id="pet-weight" v-model.number="form.weightKg" class="auth-input" type="number" min="0" step="0.1" required />
      </div>
    </div>

    <label class="auth-label" for="pet-about">About</label>
    <textarea id="pet-about" v-model.trim="form.about" class="min-h-28 w-full rounded-2xl border border-primary-100 px-[18px] py-3" placeholder="Describe more about your pet..." />

    <button
      v-if="!isCreate"
      type="button"
      class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-700"
      @click="emit('remove')"
    >
      <img src="/icon/trash.svg" alt="" class="size-4" />
      Delete Pet
    </button>

    <div class="mt-10 flex justify-end gap-3">
      <button type="button" class="min-h-12 rounded-full bg-orange-100 px-8 font-bold text-orange-700" @click="emit('cancel')">
        Cancel
      </button>
      <button class="auth-submit px-8" type="submit">
        {{ isCreate ? 'Create Pet' : 'Update Pet' }}
      </button>
    </div>
  </form>
</template>
