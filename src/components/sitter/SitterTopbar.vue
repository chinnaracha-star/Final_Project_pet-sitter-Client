<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <header class="topbar">
    <div class="identity">
      <span class="small-avatar">
        <img src="/icon/user.svg" alt="" width="20" height="20" />
      </span>
      <span>{{ name || 'Pet Sitter' }}</span>
    </div>
    <RouterLink to="/sitter/messages" class="messages" aria-label="Messages">
      <img src="/navbar/icon-chat.svg" alt="" width="20" height="20" />
      <span class="dot" aria-hidden="true"></span>
    </RouterLink>
  </header>
</template>

<style scoped>
.topbar { height: 78px; display: flex; align-items: center; justify-content: space-between; padding: 0 36px; background: white; border-bottom: 1px solid #e0e4f2; }
.identity { display: flex; gap: 14px; align-items: center; }
.small-avatar { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: #e7e9f6; color: white; font-size: 24px; }
.messages { position: relative; display: grid; place-items: center; width: 40px; height: 40px; }
.dot { position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; border-radius: 50%; background: #ff7037; }
@media (max-width: 760px) {
  .topbar { padding: 0 20px; }
}
</style>
