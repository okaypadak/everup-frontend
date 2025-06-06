<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <!-- İçerik -->
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">

          <!-- Başlık -->
          <h1 class="text-2xl font-bold text-sky-700">🚀 Aktif Sprint Özeti</h1>

          <!-- Proje Seçimi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Proje Seç</label>
            <select
                v-model="selectedProjectId"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              <option disabled value="">Bir proje seçin</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Sprint İçeriği -->
          <div v-if="selectedProjectId">
            <div v-if="activeSprint" class="space-y-6">
              <SprintMetaInfo :sprint="activeSprint" />
              <SprintProgressBar :completed="completedTaskCount" :total="projectSprintTasks.length" />
              <SprintTaskTable :tasks="projectSprintTasks" />
            </div>
            <div v-else class="text-center py-10 text-gray-500">
              📭 Bu projeye ait aktif bir sprint bulunmamaktadır.
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'
import SprintMetaInfo from '../components/sprint/SprintMetaInfo.vue'
import SprintProgressBar from '../components/sprint/SprintProgressBar.vue'
import SprintTaskTable from '../components/sprint/SprintTaskTable.vue'

// Proje listesi
const projects = [
  { id: '1', name: 'Mobil App Projesi' },
  { id: '2', name: 'Web Panel' }
]

// Sprint listesi
const sprints = [
  {
    id: 'sprint-14',
    name: 'Sprint 14 - Haziran',
    startDate: '2025-05-29',
    endDate: '2025-06-14',
    goal: 'Kullanıcı kayıt akışındaki hataları düzeltmek',
    projectId: '1'
  },
  {
    id: 'sprint-15',
    name: 'Sprint 15 - Temmuz',
    startDate: '2025-07-01',
    endDate: '2025-07-15',
    goal: 'Yeni dashboard modülü',
    projectId: '2'
  }
]

// Tüm görevler
const allTasks = [
  { id: 1, sprintId: 'sprint-14', title: 'Kayıt formu validasyon hatası', status: 'Tamamlandı' },
  { id: 2, sprintId: 'sprint-14', title: 'Mobil görünüm test et', status: 'Bekliyor' },
  { id: 3, sprintId: 'sprint-15', title: 'Yeni grafik kartı ekle', status: 'Devam' }
]

// Seçili proje
const selectedProjectId = ref('')

// Aktif sprinti hesapla
const activeSprint = computed(() => {
  const today = new Date()
  return sprints.find(s => {
    return s.projectId === selectedProjectId.value &&
        new Date(s.startDate) <= today &&
        new Date(s.endDate) >= today
  })
})

// Seçilen sprintin görevleri
const projectSprintTasks = computed(() => {
  return activeSprint.value
      ? allTasks.filter(task => task.sprintId === activeSprint.value.id)
      : []
})

// Tamamlanan görev sayısı
const completedTaskCount = computed(() => {
  return projectSprintTasks.value.filter(t => t.status === 'Tamamlandı').length
})
</script>
