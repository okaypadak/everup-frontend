<template>
  <div class="bg-gray-50 min-h-screen">
    <Navbar />
    <!-- 1:3:2 oranında grid -->
    <div
        class="grid px-8 gap-6 py-6"
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NotificationsPanel from './components/dashboard/notifications.vue'
import TaskListPanel from './components/dashboard/taskList.vue'
import TaskCreatePanel from './components/dashboard/taskCreate.vue'
import CommentListPanel from './components/dashboard/commentList.vue'
import Navbar from './components/bar/Navbar.vue'

// Statik yorumlar ve bildirimler
const comments = ref([
  { id: 1, author: 'Ahmet', text: 'Yeni görevleri gördüm, eline sağlık!', time: '5 dk önce' },
  { id: 2, author: 'Merve', text: 'Bildirimler çok iyi çalışıyor.', time: '1 saat önce' }
])

const notifications = ref([
  { id: 1, type: 'gorev', kisi: 'Ahmet', gorevKodu: 'GOREV-1001', time: '3 dk önce' },
  { id: 2, type: 'yorum', kisi: 'Merve', gorevKodu: 'GOREV-1003', time: '1 saat önce' }
])
</script>
