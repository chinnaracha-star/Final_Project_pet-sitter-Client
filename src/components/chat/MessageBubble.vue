<script setup lang="ts">
defineProps<{
  content: string | null
  imageUrl: string | null
  avatarUrl?: string
  isMine: boolean
}>()
</script>

<template>
  <div class="flex max-w-[75%] items-end gap-2" :class="isMine ? 'ml-auto flex-row-reverse' : ''">
    <img
      v-if="!isMine && avatarUrl"
      :src="avatarUrl"
      alt=""
      class="size-8 shrink-0 rounded-full object-cover"
    />
    <div
      class="overflow-hidden rounded-[22px] px-4 py-2.5 text-sm leading-6"
      :class="isMine ? 'rounded-br-md bg-orange-700 text-white' : 'rounded-bl-md bg-[#f4f4f6] text-primary-900'"
    >
      <p v-if="content">{{ content }}</p>
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt="Shared photo"
        class="mt-2 max-h-52 w-full max-w-[220px] rounded-xl object-cover"
        :class="content ? '' : 'mt-0'"
      />
    </div>
  </div>
</template>
