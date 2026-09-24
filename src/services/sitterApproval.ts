import { useAuthStore } from '../stores/auth'
import { api } from './http'

export type ApprovalStatus =
  | 'Unverified'
  | 'Waiting for verify'
  | 'Verified'
  | 'Waiting for approve'
  | 'Approved'
  | 'Rejected'

export type ProfilePayload = {
  fullName: string
  phone: string
  email: string
  experienceYears: string
  dateOfBirth: string | null
  idNumber: string
  avatarUrl: string
  introduction: string
  displayName: string
  petTypes: string[]
  services: string
  myPlace: string
  photoUrls: string[]
  addressDetail: string
  district: string
  subDistrict: string
  province: string
  postCode: string
  latitude: number | null
  longitude: number | null
  bankName: string
  accountName: string
  accountNumber: string
  bankCode: string
  bookBankImageUrl: string
}

export type ProfileResponse = {
  userId: string
  approvalStatus: ApprovalStatus
  listed: boolean
  rejectionReason: string | null
  profile: ProfilePayload
  pendingProfile: ProfilePayload | null
}

export type ListedSitter = {
  userId: string
  displayName: string
  avatarUrl: string | null
  petTypes: string[]
  services: string | null
  introduction: string | null
  province: string | null
  ownerName: string | null
  imageUrl: string | null
  experienceYears: string | null
  ratingAvg: number
  reviewCount: number
  latitude: number | null
  longitude: number | null
}

export type PublicSitterDetail = {
  userId: string
  displayName: string
  avatarUrl: string | null
  ownerName: string | null
  introduction: string | null
  services: string | null
  myPlace: string | null
  addressDetail: string | null
  subDistrict: string | null
  district: string | null
  province: string | null
  postCode: string | null
  experienceYears: string | null
  petTypes: string[]
  photoUrls: string[]
  ratingAvg: number
  reviewCount: number
  latitude: number | null
  longitude: number | null
}

export type PublicReview = {
  id: number
  ownerName: string | null
  ownerAvatarUrl: string | null
  rating: number
  comment: string | null
  createdAt: string
}

export type ListedSitterSearchParams = {
  keyword?: string
  petTypes?: string[]
  minRating?: number | null
  experience?: string
  page?: number
  limit?: number
}

export type ListedSitterSearchResponse = {
  sitters: ListedSitter[]
  currentPage: number
  totalPages: number
  totalItems: number
  limit: number
}

export const currentSitterId = () => {
  const auth = useAuthStore()
  return auth.role === 'sitter' ? auth.userId : null
}

export const getOwnProfile = () => api<ProfileResponse>('/api/sitter/profile')

export const submitProfile = (profile: ProfilePayload) =>
  api<ProfileResponse>('/api/sitter/profile/submit', {
    method: 'POST',
    body: JSON.stringify(profile),
  })

export const getApprovalQueue = () => api<ProfileResponse[]>('/api/admin/sitter-approvals')

export const getSitterApproval = (sitterId: string) =>
  api<ProfileResponse>(`/api/admin/sitter-approvals/${encodeURIComponent(sitterId)}`)

export const approveSitter = (sitterId: string) =>
  api<ProfileResponse>(`/api/admin/sitter-approvals/approve?sitterId=${encodeURIComponent(sitterId)}`, {
    method: 'PATCH',
  })

export const rejectSitter = (sitterId: string, reason: string) =>
  api<ProfileResponse>(`/api/admin/sitter-approvals/reject?sitterId=${encodeURIComponent(sitterId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  })

export const getListedSitters = (params: ListedSitterSearchParams = {}) => {
  const query = new URLSearchParams()
  if (params.keyword?.trim()) query.set('keyword', params.keyword.trim())
  params.petTypes?.forEach(petType => query.append('petType', petType))
  if (params.minRating !== null && params.minRating !== undefined) query.set('minRating', String(params.minRating))
  if (params.experience) query.set('experience', params.experience)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return api<ListedSitterSearchResponse>(`/api/sitters${suffix}`)
}

function searchQuery(params: ListedSitterSearchParams = {}) {
  const query = new URLSearchParams()
  if (params.keyword?.trim()) query.set('keyword', params.keyword.trim())
  params.petTypes?.forEach(petType => query.append('petType', petType))
  if (params.minRating !== null && params.minRating !== undefined) query.set('minRating', String(params.minRating))
  if (params.experience) query.set('experience', params.experience)
  return query
}

export const getMapSitters = (params: ListedSitterSearchParams = {}) => {
  const query = searchQuery(params)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return api<ListedSitter[]>(`/api/sitters/map${suffix}`)
}

export const getPublicSitter = (sitterId: string) =>
  api<PublicSitterDetail>(`/api/sitters/${encodeURIComponent(sitterId)}`)

export const getPublicSitterReviews = (sitterId: string) =>
  api<PublicReview[]>(`/api/sitters/${encodeURIComponent(sitterId)}/reviews`)
