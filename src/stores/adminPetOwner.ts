import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminPetOwnerStore = defineStore('adminPetOwner', () => {
  // userId shared from the owner row clicked in AdminPetOwnerView
  const selectedOwnerId = ref<string | null>(null)
  const selectedOwnerName = ref<string | null>(null)
  const selectedOwnerIsBanned = ref<boolean | null>(null)

  function selectOwner(userId: string, name: string | null = null) {
    selectedOwnerId.value = userId
    selectedOwnerName.value = name
  }

  function setSelectedOwnerIsBanned(isBanned: boolean | null) {
    selectedOwnerIsBanned.value = isBanned
  }

  return {
    selectedOwnerId,
    selectedOwnerName,
    selectedOwnerIsBanned,
    selectOwner,
    setSelectedOwnerIsBanned,
  }
})
