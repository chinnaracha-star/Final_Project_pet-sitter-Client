import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getNotifications, markAllNotificationsRead, markNotificationRead, type AppNotification } from '../services/notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([]), loading = ref(false), error = ref('')
  const unreadCount = computed(() => items.value.filter(item => !item.read).length)
  async function load() {
    loading.value = true; error.value = ''
    try { items.value = await getNotifications() }
    catch (cause) { error.value = cause instanceof Error ? cause.message : 'Unable to load notifications' }
    finally { loading.value = false }
  }
  async function read(id: number) {
    const updated = await markNotificationRead(id), index = items.value.findIndex(item => item.id === id)
    if (index >= 0) items.value[index] = updated
  }
  async function readAll() {
    await markAllNotificationsRead()
    items.value = items.value.map(item => ({ ...item, read: true }))
  }
  return { items, loading, error, unreadCount, load, read, readAll }
})
