<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AdminSidebar from '../../components/AdminSidebar.vue'
import {
  approveSitter,
  currentAdminId,
  getApprovalQueue,
  rejectSitter,
  type ProfileResponse,
} from '../../services/sitterApproval'

const queue = ref<ProfileResponse[]>([])
const reasons = reactive<Record<string, string>>({})
const notice = ref('')
const loading = ref(false)
const adminId = currentAdminId()

async function loadQueue() {
  if (!adminId) {
    notice.value = 'ตั้งค่า petSitterAdminId ใน localStorage หรือส่ง ?adminId=UUID เพื่อเชื่อม API'
    return
  }
  loading.value = true
  try {
    queue.value = await getApprovalQueue(adminId)
    notice.value = ''
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'ไม่สามารถโหลดคิวอนุมัติได้'
  } finally {
    loading.value = false
  }
}

async function approve(item: ProfileResponse) {
  if (!adminId) return
  loading.value = true
  try {
    await approveSitter(adminId, item.userId)
    queue.value = queue.value.filter(candidate => candidate.userId !== item.userId)
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'ไม่สามารถอนุมัติได้'
  } finally {
    loading.value = false
  }
}

async function reject(item: ProfileResponse) {
  if (!adminId) return
  const reason = reasons[item.userId]?.trim()
  if (!reason) {
    notice.value = 'กรุณาระบุเหตุผลที่ Reject'
    return
  }
  loading.value = true
  try {
    await rejectSitter(adminId, item.userId, reason)
    queue.value = queue.value.filter(candidate => candidate.userId !== item.userId)
  } catch (error) {
    notice.value = error instanceof Error ? error.message : 'ไม่สามารถ Reject ได้'
  } finally {
    loading.value = false
  }
}

onMounted(loadQueue)
</script>

<template>
  <div class="flex min-h-screen bg-[#f7f7fa]">
    <AdminSidebar active-path="/admin/sitters" />

    <main class="min-w-0 flex-1 px-8 py-8 text-[#30343f]">
      <header class="border-b border-[#e5e5eb] pb-6">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b8c98]">Admin Panel</p>
        <h1 class="mt-2 text-3xl font-bold">Pet Sitter Approvals</h1>
        <p class="mt-2 text-sm text-[#777c8c]">Review verification and profile approval requests.</p>
      </header>

      <p v-if="notice" class="mt-6 rounded-lg bg-[#fff1e9] p-4 text-sm text-[#9c3d19]" role="status">
        {{ notice }}
      </p>
      <p v-if="loading" class="mt-6 text-sm text-[#777c8c]">Loading...</p>
      <p v-else-if="queue.length === 0" class="mt-8 rounded-lg border border-[#e5e5eb] bg-white p-6">
        No sitter profiles are waiting for approval.
      </p>

      <section class="mt-8 grid gap-5">
        <article v-for="item in queue" :key="item.userId" class="rounded-xl border border-[#e5e5eb] bg-white p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span class="rounded-full bg-[#fff1e9] px-3 py-1 text-xs font-bold text-[#ff6b39]">
                {{ item.approvalStatus }}
              </span>
              <h2 class="mt-3 text-xl font-bold">{{ (item.pendingProfile || item.profile).fullName }}</h2>
              <p class="mt-1 text-sm text-[#777c8c]">{{ (item.pendingProfile || item.profile).email }}</p>
            </div>
            <button type="button" class="rounded-full bg-[#20b878] px-5 py-2.5 font-bold text-white disabled:opacity-50" :disabled="loading" @click="approve(item)">
              Approve
            </button>
          </div>

          <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt class="font-bold">Phone</dt><dd>{{ (item.pendingProfile || item.profile).phone }}</dd></div>
            <div><dt class="font-bold">Pet sitter name</dt><dd>{{ (item.pendingProfile || item.profile).displayName || '-' }}</dd></div>
            <div><dt class="font-bold">Pet types</dt><dd>{{ (item.pendingProfile || item.profile).petTypes.join(', ') || '-' }}</dd></div>
            <div><dt class="font-bold">Province</dt><dd>{{ (item.pendingProfile || item.profile).province || '-' }}</dd></div>
          </dl>

          <div class="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              v-model="reasons[item.userId]"
              class="min-h-11 flex-1 rounded-lg border border-[#d8ddef] px-3"
              placeholder="Reason for rejection"
              :aria-label="`Rejection reason for ${(item.pendingProfile || item.profile).fullName}`"
            />
            <button type="button" class="rounded-full border border-[#e34b4b] px-5 py-2.5 font-bold text-[#e34b4b] disabled:opacity-50" :disabled="loading" @click="reject(item)">
              Reject
            </button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>
