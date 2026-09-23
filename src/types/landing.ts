export interface SearchFilterState {
  petTypes: string[]
  rating: number | null
  experience: string
}

export interface ServiceItem {
  id: string
  title: string
  description: string
  starColor: string
}

export interface BenefitItem {
  id: string
  image: string
  highlightWord: string
  highlightColor: string
  remainingTitle: string
  line1: string
  line2: string
}
