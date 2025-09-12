<template>
  <div class="bg-gray-50 min-h-screen">
    <Navbar />

    <!-- Mobil görünüm -->
    <div class="md:hidden p-4">
      <div class="flex items-center justify-between mb-4">
        <button class="p-2 rounded-md bg-white shadow" @click="menuOpen = !menuOpen">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <div v-if="menuOpen" class="mb-4 flex flex-col gap-2">
        <button @click="openDrawer('notifications')" class="px-4 py-2 rounded bg-blue-500 text-white">
          Bildirimler
        </button>
        <button @click="openDrawer('taskCreate')" class="px-4 py-2 rounded bg-green-500 text-white">
          Görev Oluştur
        </button>
        <div v-if="canSeeSprintMenu" class="flex flex-col">
          <button
              class="px-4 py-2 rounded bg-blue-500 text-white flex items-center justify-between"
              @click="sprintMenuOpen = !sprintMenuOpen"
          >
            Sprint Yönetimi
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div v-if="sprintMenuOpen" class="mt-2 flex flex-col gap-2 ml-4">
            <NuxtLink
                v-if="hasAnyRole(['admin', 'director'])"
                to="/sprint/create"
                class="px-4 py-2 rounded bg-blue-100 text-blue-700"
            >
              Sprint Oluştur
            </NuxtLink>
            <NuxtLink
                v-if="hasAnyRole(['admin', 'director'])"
                to="/sprint/task-list"
                class="px-4 py-2 rounded bg-blue-100 text-blue-700"
            >
              Sprint Görev Listesi
            </NuxtLink>
            <NuxtLink to="/sprint/meta" class="px-4 py-2 rounded bg-blue-100 text-blue-700">Sprint Meta Bilgileri</NuxtLink>
            <NuxtLink to="/sprint/chart" class="px-4 py-2 rounded bg-blue-100 text-blue-700">Sprint Charts</NuxtLink>
          </div>
        </div>
      </div>

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
import { ref, onMounted, computed } from 'vue'
import NotificationsPanel from './components/dashboard/notifications.vue'
import TaskListPanel from './components/dashboard/taskList.vue'
import TaskCreatePanel from './components/dashboard/taskCreate.vue'
import CommentListPanel from './components/dashboard/commentList.vue'
import Navbar from './components/bar/Navbar.vue'
import DashboardDrawer from './components/dashboard/DashboardDrawer.vue'
import { useFetch } from '#app'
import { useAuthStore } from '@/stores/authStore'

const comments = ref([])
const notifications = ref([])
const drawerType = ref<null | 'notifications' | 'taskCreate'>(null)
const menuOpen = ref(false)
const sprintMenuOpen = ref(false)

const auth = useAuthStore()
const hasAnyRole = auth.hasAnyRole
const canSeeSprintMenu = computed(() => hasAnyRole(['admin', 'lead', 'director', 'developer']))

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

