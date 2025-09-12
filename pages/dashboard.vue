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
      </template>
    </Navbar>

    <div class="md:hidden p-4">
      <TaskListPanel />
    </div>

    <!-- Masaüstü görünüm: 1:3:2 oranında grid -->
    <div
        class="hidden md:grid px-8 gap-6 py-6"
        style="height: calc(100vh - 4rem); grid-template-columns: 1fr 3fr 2fr;"
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
    </div>

    <DashboardDrawer
        v-if="drawerType"
        :type="drawerType"
        :notifications="notifications"
        @close="drawerType = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NotificationsPanel from './components/dashboard/notifications.vue'
import TaskListPanel from './components/dashboard/taskList.vue'
import TaskCreatePanel from './components/dashboard/taskCreate.vue'
import CommentListPanel from './components/dashboard/commentList.vue'
import Navbar from './components/bar/Navbar.vue'
import DashboardDrawer from './components/dashboard/DashboardDrawer.vue'
import { useFetch } from '#app'

const comments = ref([])
const notifications = ref([])
const drawerType = ref<null | 'notifications' | 'taskCreate'>(null)

const openDrawer = (type: 'notifications' | 'taskCreate') => {
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

