<template>
  <div class="bg-white rounded-xl p-4 flex flex-col gap-4">
    <div class="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-2">
      <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2" stroke-width="2"/><path d="M15 3h-6a2 2 0 00-2 2v4h10V5a2 2 0 00-2-2z" stroke-width="2"/><circle cx="12" cy="14" r="2" stroke-width="2"/></svg>
      Yorumlar
    </div>
    <ul class="space-y-2">
      <template v-if="comments.length > 0">
        <li v-for="c in comments" :key="c.id" class="bg-gray-50 rounded-md px-3 py-2 flex items-start gap-2">
          <div class="flex-shrink-0">
            <svg class="w-7 h-7 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#D1FAE5"/>
              <text x="12" y="16" text-anchor="middle" fill="black" font-size="12" font-family="Arial" font-weight="bold">{{ c.author[0] }}</text>
            </svg>
          </div>
          <div>
            <div class="font-semibold text-gray-800">{{ c.author }}</div>
            <div class="text-sm text-gray-700">{{ c.text }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ c.time }}</div>
          </div>
        </li>
      </template>
      <template v-else>
        <li class="text-gray-400 text-center py-6 select-none">
          Henüz bir yorum yok.
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Comment {
  id: number | string
  author: string
  text: string
  time: string
}

const props = defineProps<{
  comments: Comment[]
}>()
</script>

