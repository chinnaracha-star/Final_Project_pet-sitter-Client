import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthRole } from '../types/auth'
import type { OwnerProfile } from '../types/owner'

const STORAGE_KEY = 'petsetter-auth'

const defaultOwner: OwnerProfile = {
  name: 'John Wick',
  email: 'johnwicklovedogs@dogorg.com',
  phone: '099 996 6734',
  idNumber: '1122 21 236 8654',
  dateOfBirth: '1964-09-02',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
}

function loadSession(): { role: AuthRole | null; profile: OwnerProfile } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { role: null, profile: { ...defaultOwner } }
    return JSON.parse(raw) as { role: AuthRole | null; profile: OwnerProfile }
  } catch {
    return { role: null, profile: { ...defaultOwner } }
  }
}

export const useAuthStore = defineStore('auth', () => {
  const saved = loadSession()
  const role = ref<AuthRole | null>(saved.role)
  const profile = ref<OwnerProfile>(saved.profile)

  const isLoggedIn = computed(() => role.value !== null)
  const isOwnerLoggedIn = computed(() => role.value === 'owner')

  function persist() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ role: role.value, profile: profile.value }))
  }

  function loginAsOwner(partial?: Partial<OwnerProfile>) {
    role.value = 'owner'
    profile.value = { ...defaultOwner, ...profile.value, ...partial }
    persist()
  }

  function loginAsSitter() {
    role.value = 'sitter'
    persist()
  }

  function updateOwnerProfile(next: Omit<OwnerProfile, 'email'> & { email?: string }) {
    profile.value = {
      ...profile.value,
      ...next,
      email: profile.value.email,
    }
    persist()
  }

  function logout() {
    role.value = null
    persist()
  }

  return { role, profile, isLoggedIn, isOwnerLoggedIn, loginAsOwner, loginAsSitter, updateOwnerProfile, logout }
})
