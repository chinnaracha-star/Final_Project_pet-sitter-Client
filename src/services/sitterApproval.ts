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
}

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new Error(problem?.detail || problem?.message || `Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

export const currentSitterId = () =>
  localStorage.getItem('petSitterUserId') || new URLSearchParams(location.search).get('userId')

export const currentAdminId = () =>
  localStorage.getItem('petSitterAdminId') || new URLSearchParams(location.search).get('adminId')

export const getOwnProfile = (userId: string) =>
  request<ProfileResponse>('/api/sitter/profile', { headers: { 'X-User-Id': userId } })

export const submitProfile = (userId: string, profile: ProfilePayload) =>
  request<ProfileResponse>('/api/sitter/profile/submit', {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: JSON.stringify(profile),
  })

export const getApprovalQueue = (adminId: string) =>
  request<ProfileResponse[]>('/api/admin/sitter-approvals', { headers: { 'X-Admin-Id': adminId } })

export const approveSitter = (adminId: string, sitterId: string) =>
  request<ProfileResponse>(`/api/admin/sitter-approvals/approve?sitterId=${encodeURIComponent(sitterId)}`, {
    method: 'PATCH',
    headers: { 'X-Admin-Id': adminId },
  })

export const rejectSitter = (adminId: string, sitterId: string, reason: string) =>
  request<ProfileResponse>(`/api/admin/sitter-approvals/reject?sitterId=${encodeURIComponent(sitterId)}`, {
    method: 'PATCH',
    headers: { 'X-Admin-Id': adminId },
    body: JSON.stringify({ reason }),
  })

export const getListedSitters = () => request<ListedSitter[]>('/api/sitters')
