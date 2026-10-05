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

function signUpMessage(message: string) {
  const text = message.toLowerCase()
  if (text.includes('already registered') || text.includes('already been registered') || text.includes('already exists')) {
    return 'This email is already registered.'
  }
  return message
}

function loginMessage(cause: unknown) {
  if (typeof cause === 'string') return loginMessage(new Error(cause))
  if (cause instanceof ApiError) {
    const text = cause.message.toLowerCase()
    if (cause.status === 403 || text.includes('banned')) return 'This account is banned.'
    if (cause.status === 409 && text.includes('phone')) return 'This phone number is already registered.'
    if (cause.status === 409 && text.includes('email')) return 'This email is already registered.'
    if (cause.status === 502 || cause.status === 503) return 'Unable to connect to the server. Please try again.'
    return cause.message
  }
  if (cause instanceof Error) {
    const text = cause.message.toLowerCase()
    if (text.includes('invalid login credentials') || text.includes('invalid email or password')) {
      return 'Invalid email or password.'
    }
    if (text.includes('email not confirmed')) return 'Please check your email for verification.'
    if (text.includes('banned')) return 'This account is banned.'
    return cause.message
  }
  return 'Login failed'
}

function registerApiMessage(cause: unknown) {
  if (cause instanceof ApiError) {
    const text = cause.message.toLowerCase()
    if (cause.status === 409 && text.includes('phone')) return 'This phone number is already registered.'
    if (cause.status === 409 && text.includes('email')) return 'This email is already registered.'
    if (cause.status === 502 || cause.status === 503) return 'Unable to connect to the server. Please try again.'
  }
  return cause instanceof Error ? cause.message : 'Registration failed'
}

const defaultMockProfile: OwnerProfile = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '081-234-5678',
  idNumber: '1234567890123',
  dateOfBirth: '1995-05-15',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
}

export const useAuthStore = defineStore('auth', () => {
  const isExplicitlyLoggedOut = typeof window !== 'undefined' && sessionStorage.getItem('pet_sitter_dev_logged_out') === 'true'
  const shouldMockOwner = !isSupabaseConfigured && !isExplicitlyLoggedOut

  const role = ref<AuthRole | null>(shouldMockOwner ? 'owner' : null)
  const profile = ref<OwnerProfile>(shouldMockOwner ? { ...defaultMockProfile } : { ...emptyProfile })
  const userId = ref<string | null>(shouldMockOwner ? 'mock-user-123' : null)
  const profileComplete = ref(shouldMockOwner)
  const isAdmin = ref(false)
  const ready = ref(!isSupabaseConfigured)

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
    if (!isSupabaseConfigured) {
      sessionStorage.removeItem('pet_sitter_dev_logged_out')
      role.value = input.role
      profile.value = {
        ...defaultMockProfile,
        name: input.name,
        email: input.email,
        phone: input.phone,
      }
      userId.value = 'mock-user-123'
      profileComplete.value = true
      return 'confirmed' as const
    }
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { name: input.name, phone: input.phone, role: input.role } },
    })
    if (error) throw new Error(signUpMessage(error.message))
    if (!data.session) return 'check-email' as const
    try {
      applyMe(await bootstrapAccount(input.name, input.phone, input.role))
    } catch (cause) {
      throw new Error(registerApiMessage(cause))
    }
    return 'confirmed' as const
  }

  async function login(email: string, password: string, roleHint: AuthRole = 'owner') {
    if (!isSupabaseConfigured) {
      sessionStorage.removeItem('pet_sitter_dev_logged_out')
      role.value = roleHint
      profile.value = {
        ...defaultMockProfile,
        email: email || defaultMockProfile.email,
        name: email ? email.split('@')[0] : defaultMockProfile.name,
      }
      userId.value = 'mock-user-123'
      profileComplete.value = true
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(loginMessage(error.message))
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
      throw new Error(loginMessage(cause))
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!isSupabaseConfigured) return
    const email = profile.value.email
    const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (reauthError) throw new Error('Current password is incorrect.')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }

  async function updateOwnerProfile(next: Omit<OwnerProfile, 'email'> & { email?: string }) {
    try {
      applyMe(await saveOwnerProfile({
        name: next.name,
        phone: next.phone,
        idNumber: next.idNumber,
        dateOfBirth: next.dateOfBirth,
        avatarUrl: next.avatarUrl,
      }))
    } catch {
      Object.assign(profile.value, next)
    }
  }

  async function logout() {
    sessionStorage.setItem('pet_sitter_dev_logged_out', 'true')
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {})
    }
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
