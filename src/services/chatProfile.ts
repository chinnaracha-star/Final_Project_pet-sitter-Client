import type { ChatConversation } from '../types/chat'
import { useAuthStore } from '../stores/auth'
import { getSitterBookings, type SitterBooking } from './sitterBookings'
import { getOwnProfile, getPublicSitter } from './sitterApproval'
import { api } from './http'

type ChatPeerInfo = { name: string; avatar: string }

const sitterCache = new Map<string, ChatPeerInfo>()
const ownerCache = new Map<string, ChatPeerInfo>()
let ownSitterProfile: ChatPeerInfo | null | undefined
let ownerDirectory: Array<ChatPeerInfo & { id: string }> | undefined

function isGenericName(name: string, fallback: string) {
  return !name.trim() || name === fallback
}

export function chatSelfAvatar() {
  const auth = useAuthStore()
  if (auth.role === 'pet-sitter') {
    return ownSitterProfile?.avatar || auth.profile.avatarUrl || '/icon/user.svg'
  }
  return auth.profile.avatarUrl || '/icon/user.svg'
}

export function mergeConversation(
  remote: ChatConversation,
  previous?: ChatConversation,
): ChatConversation {
  return {
    ...remote,
    ownerName: isGenericName(remote.ownerName, 'Pet Owner') ? previous?.ownerName || remote.ownerName : remote.ownerName,
    ownerAvatar: remote.ownerAvatar || previous?.ownerAvatar || '',
    sitterName: isGenericName(remote.sitterName, 'Pet Sitter') ? previous?.sitterName || remote.sitterName : remote.sitterName,
    sitterAvatar: remote.sitterAvatar || previous?.sitterAvatar || '',
  }
}

function applyLoggedInUser(conversation: ChatConversation): ChatConversation {
  const auth = useAuthStore()
  const next = { ...conversation }
  if (auth.userId && next.ownerId === auth.userId) {
    next.ownerName = auth.profile.name || next.ownerName
    next.ownerAvatar = auth.profile.avatarUrl || next.ownerAvatar
  }
  if (auth.userId && next.sitterId === auth.userId) {
    next.sitterName = ownSitterProfile?.name || auth.profile.name || next.sitterName
    next.sitterAvatar = ownSitterProfile?.avatar || auth.profile.avatarUrl || next.sitterAvatar
  }
  return next
}

async function loadOwnSitterProfile() {
  if (ownSitterProfile !== undefined) return
  const auth = useAuthStore()
  if (auth.role !== 'pet-sitter') {
    ownSitterProfile = null
    return
  }
  try {
    const response = await getOwnProfile()
    ownSitterProfile = {
      name: response.profile.displayName || response.profile.fullName || '',
      avatar: response.profile.avatarUrl || '',
    }
  } catch {
    ownSitterProfile = null
  }
}

async function loadPublicSitter(sitterId: string) {
  const cached = sitterCache.get(sitterId)
  if (cached) return cached
  const detail = await getPublicSitter(sitterId)
  const peer = {
    name: detail.displayName || detail.ownerName || '',
    avatar: detail.avatarUrl || '',
  }
  sitterCache.set(sitterId, peer)
  return peer
}

function ownerIdFromBooking(booking: SitterBooking & { ownerId?: string; owner_id?: string }) {
  return String(booking.owner.userId || booking.owner.id || booking.ownerId || booking.owner_id || '')
}

async function loadOwnerDirectory() {
  if (ownerDirectory) return ownerDirectory
  const auth = useAuthStore()
  if (auth.role !== 'pet-sitter') {
    ownerDirectory = []
    return ownerDirectory
  }
  try {
    const bookings = await getSitterBookings()
    ownerDirectory = bookings.map(booking => ({
      id: ownerIdFromBooking(booking),
      name: booking.owner.name || '',
      avatar: booking.owner.avatarUrl || '',
    })).filter(item => item.name || item.avatar)
  } catch {
    ownerDirectory = []
  }
  return ownerDirectory
}

async function loadOwnerById(ownerId: string) {
  const cached = ownerCache.get(ownerId)
  if (cached) return cached
  for (const path of [`/api/users/${ownerId}`, `/api/owners/${ownerId}`]) {
    try {
      const payload = await api<Record<string, unknown>>(path)
      const peer = {
        name: String(payload.name || payload.fullName || payload.displayName || ''),
        avatar: String(payload.avatarUrl || payload.avatar_url || payload.avatar || ''),
      }
      if (peer.name || peer.avatar) {
        ownerCache.set(ownerId, peer)
        return peer
      }
    } catch {
      /* endpoint may not exist */
    }
  }
  return null
}

function matchOwnerFromBookings(conversation: ChatConversation, directory: Array<ChatPeerInfo & { id: string }>) {
  return directory.find(item => item.id && item.id === conversation.ownerId)
    || directory.find(item => item.name && item.name === conversation.ownerName && conversation.ownerName !== 'Pet Owner')
}

export async function hydrateConversation(conversation: ChatConversation): Promise<ChatConversation> {
  await loadOwnSitterProfile()
  let next = applyLoggedInUser(conversation)
  if (next.sitterId && (isGenericName(next.sitterName, 'Pet Sitter') || !next.sitterAvatar)) {
    try {
      const sitter = await loadPublicSitter(next.sitterId)
      next = {
        ...next,
        sitterName: sitter.name || next.sitterName,
        sitterAvatar: sitter.avatar || next.sitterAvatar,
      }
    } catch {
      /* public profile may be unpublished */
    }
  }
  if (isGenericName(next.ownerName, 'Pet Owner') || !next.ownerAvatar) {
    const directory = await loadOwnerDirectory()
    const fromBooking = matchOwnerFromBookings(next, directory)
    if (fromBooking) {
      next = {
        ...next,
        ownerName: fromBooking.name || next.ownerName,
        ownerAvatar: fromBooking.avatar || next.ownerAvatar,
      }
    }
    if (next.ownerId && (isGenericName(next.ownerName, 'Pet Owner') || !next.ownerAvatar)) {
      const fromApi = await loadOwnerById(next.ownerId)
      if (fromApi) {
        next = {
          ...next,
          ownerName: fromApi.name || next.ownerName,
          ownerAvatar: fromApi.avatar || next.ownerAvatar,
        }
      }
    }
  }
  return applyLoggedInUser(next)
}

export async function hydrateConversations(items: ChatConversation[]) {
  await loadOwnSitterProfile()
  return Promise.all(items.map(item => hydrateConversation(item)))
}
