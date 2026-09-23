import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { ApiError } from '../services/http'
import { bootstrapAccount, getMe, updateOwnerProfile as saveOwnerProfile, type AuthMe } from '../services/ownerApi'
import type { AuthRole } from '../types/auth'
import type { OwnerProfile } from '../types/owner'

const emptyProfile: OwnerProfile = {
  name: '',
  email: '',
  phone: '',
  idNumber: '',
  dateOfBirth: '',
  avatarUrl: '',
}

function toProfile(me: AuthMe): OwnerProfile {
  return {
    name: me.name || '',
    email: me.email || '',
    phone: me.phone || '',
    idNumber: me.idNumber || '',
    dateOfBirth: me.dateOfBirth || '',
    avatarUrl: me.avatarUrl || '',
  }
}

export const useAuthStore = defineStore('auth', () => {
  const role = ref<AuthRole | null>(null)
  const profile = ref<OwnerProfile>({ ...emptyProfile })
  const userId = ref<string | null>(null)
  const profileComplete = ref(false)
  const isAdmin = ref(false)
  const ready = ref(false)

  const isLoggedIn = computed(() => role.value !== null)
  const isOwnerLoggedIn = computed(() => role.value === 'owner')

  function applyMe(me: AuthMe) {
    role.value = me.role
    profile.value = toProfile(me)
    userId.value = me.id
    profileComplete.value = me.profileComplete
    isAdmin.value = me.admin
  }

  function clear() {
    role.value = null
    profile.value = { ...emptyProfile }
    userId.value = null
    profileComplete.value = false
    isAdmin.value = false
  }

  async function restore() {
    if (ready.value) return
    try {
      if (!isSupabaseConfigured) return
      const { data } = await supabase.auth.getSession()
      if (!data.session) return
      applyMe(await getMe())
    } catch {
      await supabase.auth.signOut()
      clear()
    } finally {
      ready.value = true
    }
  }

  async function register(input: { name: string; email: string; phone: string; password: string; role: AuthRole }) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { name: input.name, phone: input.phone, role: input.role } },
    })
    if (error) throw new Error(error.message)
    if (!data.session) {
      throw new Error('Check your email to confirm the account, then log in.')
    }
    applyMe(await bootstrapAccount(input.name, input.phone, input.role))
  }

  async function login(email: string, password: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    const { data: userData } = await supabase.auth.getUser()
    const meta = userData.user?.user_metadata || {}
    try {
      applyMe(await getMe())
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 404) {
        applyMe(await bootstrapAccount(
          String(meta.name || userData.user?.email || 'Owner'),
          String(meta.phone || '0000000000'),
          meta.role === 'sitter' ? 'sitter' : 'owner',
        ))
        return
      }
      await supabase.auth.signOut()
      throw cause
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const email = profile.value.email
    const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (reauthError) throw new Error('Current password is incorrect.')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }

  async function updateOwnerProfile(next: Omit<OwnerProfile, 'email'> & { email?: string }) {
    applyMe(await saveOwnerProfile({
      name: next.name,
      phone: next.phone,
      idNumber: next.idNumber,
      dateOfBirth: next.dateOfBirth,
      avatarUrl: next.avatarUrl,
    }))
  }

  async function logout() {
    await supabase.auth.signOut()
    clear()
  }

  return {
    role,
    profile,
    userId,
    profileComplete,
    isAdmin,
    ready,
    isLoggedIn,
    isOwnerLoggedIn,
    restore,
    register,
    login,
    changePassword,
    updateOwnerProfile,
    logout,
  }
})
