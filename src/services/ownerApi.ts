import { api } from './http'
import type { AuthRole } from '../types/auth'
import type { OwnerProfile } from '../types/owner'

export type AuthMe = {
  id: string
  role: AuthRole
  name: string
  email: string
  phone: string | null
  idNumber: string | null
  dateOfBirth: string | null
  avatarUrl: string | null
  profileComplete: boolean
  banned: boolean
}

export type PetPayload = {
  name: string
  petType: string
  breed: string
  sex: string
  ageMonths: number
  color: string
  weightKg: number
  about: string
  avatarUrl: string
}

export const bootstrapAccount = (name: string, phone: string, role: AuthRole) =>
  api<AuthMe>('/api/auth/bootstrap', {
    method: 'POST',
    body: JSON.stringify({ name, phone, role }),
  })

export const getMe = () => api<AuthMe>('/api/auth/me')

export const updateOwnerProfile = (profile: Omit<OwnerProfile, 'email'>) =>
  api<AuthMe>('/api/owner/profile', {
    method: 'PUT',
    body: JSON.stringify({
      name: profile.name,
      phone: profile.phone,
      idNumber: profile.idNumber || null,
      dateOfBirth: profile.dateOfBirth || null,
      avatarUrl: profile.avatarUrl || null,
    }),
  })

export const uploadOwnerMedia = async (file: File, folder: 'profile' | 'pet') => {
  const body = new FormData()
  body.append('file', file)
  body.append('folder', folder)
  return api<{ url: string }>('/api/owner/media', { method: 'POST', body })
}

export const listOwnerPets = () => api<Array<PetPayload & { id: number }>>('/api/owner/pets')

export const getOwnerPet = (id: number) => api<PetPayload & { id: number }>(`/api/owner/pets/${id}`)

export const createOwnerPet = (payload: PetPayload) =>
  api<PetPayload & { id: number }>('/api/owner/pets', { method: 'POST', body: JSON.stringify(payload) })

export const updateOwnerPet = (id: number, payload: PetPayload) =>
  api<PetPayload & { id: number }>(`/api/owner/pets/${id}`, { method: 'PUT', body: JSON.stringify(payload) })

export const deleteOwnerPet = (id: number) => api<void>(`/api/owner/pets/${id}`, { method: 'DELETE' })
