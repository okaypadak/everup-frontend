<template>
  <div class="bg-gray-50 min-h-screen">
    <Navbar>
      <template #mobile-menu>
        <button @click="openDrawer('notifications')" class="px-4 py-2 rounded bg-blue-500 text-white mb-2 w-full text-left">
          Bildirimler
        </button>
        <button @click="openDrawer('taskCreate')" class="px-4 py-2 rounded bg-green-500 text-white w-full text-left">
          Görev Oluştur
        </button>
        <button @click="openDrawer('pomodoro')" class="mt-2 px-4 py-2 rounded bg-red-500 text-white w-full text-left">
          Pomodoro Sayacı
        </button>
      </template>
    </Navbar>

    <div class="md:hidden p-4 space-y-4">
      <TaskListPanel />
      <PomodoroTimer />
    </div>

    <!-- Masaüstü görünüm -->
    <div
        class="hidden md:grid px-8 gap-6 py-6"
        :style="desktopGridStyle"
    >
      <!-- Bildirimler + Yorumlar -->
      <div class="bg-white rounded-xl shadow h-full flex flex-col overflow-hidden">
        <div class="flex-1 min-h-0 flex flex-col">
          <div class="overflow-y-auto flex-1 min-h-0">
            <NotificationsPanel :notifications="notifications" />
          </div>
        </div>
        <div class="flex-1 min-h-0 flex flex-col mt-4">
          <div class="overflow-y-auto flex-1 min-h-0">
            <CommentListPanel :comments="comments" />
          </div>
        </div>
      </div>

      <!-- Görev Listesi -->
      <TaskListPanel/>

      <!-- Görev Oluştur -->
      <TaskCreatePanel class="flex flex-col h-full"/>

      <!-- Pomodoro Zamanlayıcı -->
      <PomodoroTimer
          v-if="isPomodoroVisible"
          class="flex flex-col h-full"
          @minimize="isPomodoroVisible = false"
      />
    </div>

    <button
        v-if="!isPomodoroVisible"
        type="button"
        @click="isPomodoroVisible = true"
        class="fixed bottom-6 right-6 z-40 h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-b from-red-400 to-red-600 text-white shadow-2xl hover:scale-105 transition focus:outline-none focus:ring-4 focus:ring-red-300"
    >
      <span class="sr-only">Pomodoro Zamanlayıcısını aç</span>
      <span class="text-xl drop-shadow">🍅</span>
    </button>

    <DashboardDrawer
        v-if="drawerType"
        :type="drawerType"
        :notifications="notifications"
        @close="drawerType = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import NotificationsPanel from './components/dashboard/notifications.vue'
import TaskListPanel from './components/dashboard/taskList.vue'
import TaskCreatePanel from './components/dashboard/taskCreate.vue'
import CommentListPanel from './components/dashboard/commentList.vue'
import PomodoroTimer from './components/dashboard/pomodoroTimer.vue'
import Navbar from './components/bar/Navbar.vue'
import DashboardDrawer from './components/dashboard/DashboardDrawer.vue'
import { useFetch } from '#app'

const comments = ref([])
const notifications = ref([])
const drawerType = ref<null | 'notifications' | 'taskCreate' | 'pomodoro'>(null)
const isPomodoroVisible = ref(false)

const desktopGridStyle = computed(() => ({
  height: 'calc(100vh - 4rem)',
  gridTemplateColumns: isPomodoroVisible.value ? '1fr 3fr 2fr 2fr' : '1fr 3fr 2fr'
}))

const openDrawer = (type: 'notifications' | 'taskCreate' | 'pomodoro') => {
  drawerType.value = type
}

onMounted(async () => {
  try {
    // Yorumları çek
    const { data: commentData, error: commentError } = await useFetch('/api/comments/mine')
    if (commentError.value) {
      console.error('Yorumlar alınırken hata:', commentError.value)
    } else {
      comments.value = commentData.value || []
    }

    // Bildirimleri çek
    const { data: notifData, error: notifError } = await useFetch('/api/notifications/mine')
    if (notifError.value) {
      console.error('Bildirimler alınırken hata:', notifError.value)
    } else {
      notifications.value = notifData.value || []
    }
  } catch (err) {
    console.error('Veriler alınırken beklenmeyen hata:', err)
  }
})
</script>
