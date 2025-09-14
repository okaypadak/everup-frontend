<template>
  <div class="bg-white rounded-xl p-4 flex flex-col gap-4">
    <div class="flex items-center gap-2 text-lg font-semibold text-black mb-2">
      <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Bildirimler
    </div>

    <ul class="space-y-2">
      <template v-if="parsedNotifications.length > 0">
        <li
            v-for="n in parsedNotifications"
            :key="n.id"
            class="bg-blue-50 rounded-md px-3 py-2 flex items-start gap-2 transition-all hover:shadow hover:scale-105 cursor-pointer"
        >
          <svg class="w-5 h-5 text-blue-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="flex-1">
            <div class="text-sm text-black">{{ n.message }}</div>
            <div class="text-xs text-black mt-1">{{ n.time }}</div>
          </div>
        </li>
      </template>
      <template v-else>
        <li class="text-black text-center py-6 select-none">
          Henüz bir bildirim yok.
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface RawNotification {
  id: number
  message: string
  isRead: boolean
  createdAt: string
}

const props = defineProps<{
  notifications: RawNotification[]
}>()

const parsedNotifications = computed(() =>
    props.notifications.map(n => ({
      id: n.id,
      message: n.message,
      time: formatDistanceToNow(new Date(n.createdAt), {
        addSuffix: true,
        locale: tr,
      }),
    }))
)
</script>
