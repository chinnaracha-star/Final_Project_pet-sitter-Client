import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type SitterStatus = 'Waiting for approve' | 'Approved' | 'Rejected'
export type AdminTab = 'Profile' | 'Booking' | 'Reviews' | 'Report'

export interface Sitter {
  id: number
  name: string
  sitterName: string
  email: string
  status: SitterStatus
}

export const useAdminPetSitterStore = defineStore('adminPetSitter', () => {
  const sitters = ref<Sitter[]>([
    { id: 1, name: 'Jane Maison', sitterName: 'Happy House!', email: 'janemaison@gmail.com', status: 'Waiting for approve' },
    { id: 2, name: 'Jane Maison', sitterName: 'Happy House!', email: 'janemaison@gmail.com', status: 'Waiting for approve' },
    { id: 3, name: 'Jane Maison', sitterName: 'Happy House!', email: 'janemaison@gmail.com', status: 'Waiting for approve' },
    { id: 4, name: 'Jane Maison', sitterName: 'Happy House!', email: 'janemaison@gmail.com', status: 'Approved' },
    { id: 5, name: 'Jane Maison', sitterName: 'Happy House!', email: 'janemaison@gmail.com', status: 'Approved' },
    { id: 6, name: 'Jane Maison', sitterName: 'Happy House!', email: 'janemaison@gmail.com', status: 'Approved' },
    { id: 7, name: 'Jane Maison', sitterName: 'Happy House!', email: 'janemaison@gmail.com', status: 'Rejected' },
    { id: 8, name: 'Jane Maison', sitterName: 'Happy House!', email: 'janemaison@gmail.com', status: 'Approved' },
  ])

  // id of the sitter currently opened from the list, shared across Admin sub-views
  const selectedSitterId = ref<number | null>(null)
  const activeTab = ref<AdminTab>('Profile')

  const selectedSitter = computed(() => sitters.value.find((sitter) => sitter.id === selectedSitterId.value) ?? null)

  function selectSitter(id: number) {
    selectedSitterId.value = id
    activeTab.value = 'Profile'
  }

  function setApprovalStatus(id: number, status: Exclude<SitterStatus, 'Waiting for approve'>) {
    const sitter = sitters.value.find((s) => s.id === id)
    if (sitter) sitter.status = status
  }

  return { sitters, selectedSitterId, selectedSitter, activeTab, selectSitter, setApprovalStatus }
})
