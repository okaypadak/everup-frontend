<template>
  <div class="bg-white rounded-xl p-4 flex flex-col gap-4">
    <div class="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-2">
      <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Bildirimler
    </div>
    <ul class="space-y-2">
      <template v-if="notifications.length > 0">
        <li v-for="n in notifications" :key="n.id"
            class="bg-blue-50 rounded-md px-3 py-2 flex items-center gap-2 transition-all hover:shadow hover:scale-105 cursor-pointer">
          <span>
            <svg v-if="n.type === 'gorev'" class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="n.type === 'yorum'" class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="text-sm text-gray-800 flex-1">
            <span v-if="n.type === 'gorev'">
              Yeni görev atandı:
              <a
                  :href="`/tasks/${n.gorevKodu}`"
                  class="text-blue-500 font-semibold transition-all hover:underline hover:text-blue-700 hover:scale-105"
                  target="_blank"
                  rel="noopener noreferrer"
              >{{ n.gorevKodu }}</a>
            </span>
            <span v-else-if="n.type === 'yorum'">
              {{ n.kisi }} yeni yorum yazdı:
              <a
                  :href="`/tasks/${n.gorevKodu}`"
                  class="text-blue-500 font-semibold transition-all hover:underline hover:text-blue-700 hover:scale-105"
                  target="_blank"
                  rel="noopener noreferrer"
              >{{ n.gorevKodu }}</a>
            </span>
          </span>
          <div class="text-xs text-gray-400 ml-2">{{ n.time }}</div>
        </li>
      </template>
      <template v-else>
        <li class="text-gray-400 text-center py-6 select-none">
          Henüz bir bildirim yok.
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">

interface Notification {
  id: number | string
  type: string
  gorevKodu?: string
  kisi?: string
  time: string
}

const props = defineProps<{
  notifications: Notification[]
}>()
</script>

