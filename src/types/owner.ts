export type PetTypeName = 'Dog' | 'Cat' | 'Bird' | 'Rabbit'
export type PetSex = 'Male' | 'Female'
export type BookingStatus = 'pending' | 'confirmed' | 'in_service' | 'completed' | 'cancelled'

export interface OwnerProfile {
  name: string
  email: string
  phone: string
  idNumber: string
  dateOfBirth: string
  avatarUrl: string
}

export interface OwnerPet {
  id: number
  name: string
  petType: PetTypeName
  breed: string
  sex: PetSex
  ageMonths: number
  color: string
  weightKg: number
  about: string
  avatarUrl: string
}

export interface OwnerReview {
  rating: number
  comment: string
  createdAt: string
}

export interface OwnerBooking {
  id: number
  sitterId: string
  sitterName: string
  sitterOwner: string
  sitterAvatar: string
  status: BookingStatus
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  durationHours: number
  durationLabel: string
  petNames: string[]
  totalPrice: number
  transactionNo: string
  transactionDate: string
  bannerText: string
  completedAt?: string | null
  mapQuery: string
  review?: OwnerReview | null
}

export const PET_TYPES: PetTypeName[] = ['Dog', 'Cat', 'Bird', 'Rabbit']
