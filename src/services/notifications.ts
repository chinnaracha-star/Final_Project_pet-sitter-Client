import { api } from './http'

export interface AppNotification { id: number; type: string; content: string; read: boolean; createdAt: string }
export const getNotifications = () => api<AppNotification[]>('/api/notifications')
export const markNotificationRead = (id: number) => api<AppNotification>(`/api/notifications/${id}/read`, { method: 'PATCH' })
export const markAllNotificationsRead = () => api<void>('/api/notifications/read-all', { method: 'PATCH' })
