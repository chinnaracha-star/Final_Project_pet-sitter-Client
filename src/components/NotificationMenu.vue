<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useNotificationsStore } from '../stores/notifications'
const notifications = useNotificationsStore(), open = ref(false)
onMounted(() => void notifications.load())
function toggle() { open.value = !open.value; if (open.value) void notifications.load() }
function date(value: string) { return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
</script>

<template>
  <div class="notification-menu">
    <button type="button" class="notification-button" aria-label="Open notifications" :aria-expanded="open" @click="toggle">
      <img src="/icon/bell.svg" alt="" /><span v-if="notifications.unreadCount" class="notification-dot" aria-label="Unread notifications"></span>
    </button>
    <section v-if="open" class="notification-panel" aria-label="Notifications">
      <header><strong>Notifications</strong><button v-if="notifications.unreadCount" type="button" @click="notifications.readAll">Mark all read</button></header>
      <p v-if="notifications.loading">Loading...</p>
      <p v-else-if="notifications.error" class="error">{{ notifications.error }}</p>
      <template v-else>
        <button v-for="item in notifications.items" :key="item.id" type="button" class="notification-item" :class="{ unread: !item.read }" @click="notifications.read(item.id)">
          <span>{{ item.content }}</span><small>{{ date(item.createdAt) }}</small>
        </button>
        <p v-if="!notifications.items.length">No notifications.</p>
      </template>
    </section>
  </div>
</template>

<style scoped>
.notification-menu{position:relative}.notification-button{position:relative;display:grid;width:44px;height:44px;place-items:center;border:0;border-radius:50%;background:transparent}.notification-button:hover{background:#f6f7fb}.notification-button img{width:22px;height:22px}.notification-dot{position:absolute;top:9px;right:9px;width:8px;height:8px;border-radius:50%;background:#ff6525}.notification-panel{position:absolute;z-index:60;top:52px;right:0;width:min(360px,calc(100vw - 32px));max-height:430px;overflow:auto;border:1px solid #e4e6ef;border-radius:14px;background:#fff;box-shadow:0 18px 45px rgb(24 29 46 / 18%)}header{display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid #eef0f6}header button{border:0;background:none;color:#ff6525;font-size:12px}.notification-item{display:grid;width:100%;gap:5px;padding:14px 16px;border:0;border-bottom:1px solid #f0f1f6;background:#fff;text-align:left;color:#292a36}.notification-item.unread{background:#fff5f0}.notification-item small,.notification-panel>p{color:#9298ab}.notification-panel>p{padding:16px}.error{color:#d33!important}
</style>
