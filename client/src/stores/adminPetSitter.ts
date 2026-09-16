import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SitterStatus =
  | 'Unverified'
  | 'Waiting for verify'
  | 'Verified'
  | 'Waiting for approve'
  | 'Approved'
  | 'Rejected'

export type AdminTab = 'Profile' | 'Booking' | 'Reviews' | 'Report'

export const useAdminPetSitterStore = defineStore('adminPetSitter', () => {
  // userId and approval status shared from the sitter row clicked in AdminPetSitterView
  const selectedSitterId = ref<string | null>(null)
  const selectedSitterStatus = ref<SitterStatus | null>(null)
  const selectedSitterName = ref<string | null>(null)
  const activeTab = ref<AdminTab>('Profile')

  function selectSitter(userId: string, status: SitterStatus, name: string | null = null) {
    selectedSitterId.value = userId
    selectedSitterStatus.value = status
    selectedSitterName.value = name
    activeTab.value = 'Profile'
  }

  function setApprovalStatus(status: Exclude<SitterStatus, 'Waiting for approve'>) {
    selectedSitterStatus.value = status
  }

  return {
    selectedSitterId,
    selectedSitterStatus,
    selectedSitterName,
    activeTab,
    selectSitter,
    setApprovalStatus,
  }
})
