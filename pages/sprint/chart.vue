<script setup>
import { computed } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'
import SprintBurndownChart from '../components/sprint/SprintBurndownChart.vue'
import SprintCompletedTasksChart from '../components/sprint/SprintCompletedBarChart.vue'

const sprint = {
  id: "sprint-14",
  name: "Sprint 14 - Haziran",
  startDate: "2025-05-29",
  endDate: "2025-06-14",
  goal: "Kullanıcı kayıt akışındaki hataları düzeltmek ve mobil responsive tasarımı tamamlamak."
}

const sprintTasks = [
  { id: 1, title: "Kayıt formu validasyon hatası", status: "Tamamlandı" },
  { id: 2, title: "Mobil görünüm test et", status: "Devam" },
  { id: 3, title: "Email doğrulama bug'ı düzelt", status: "Tamamlandı" },
  { id: 4, title: "Yönlendirme kontrolü", status: "Devam" },
  { id: 5, title: "Mobil tuş tepkisizliği", status: "Bekliyor" },
  { id: 6, title: "Şifre sıfırlama testi", status: "Tamamlandı" },
  { id: 7, title: "Profil düzenleme bug", status: "Tamamlandı" },
  { id: 8, title: "Yeni kullanıcı yönlendirmesi", status: "Tamamlandı" }
]

function formatDate(dateStr) {
  const options = { day: '2-digit', month: 'short', year: 'numeric' }
  return new Date(dateStr).toLocaleDateString('tr-TR', options)
}

const remainingDays = computed(() => {
  const today = new Date()
  const end = new Date(sprint.endDate)
  const diff = end.getTime() - today.getTime()
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <div class="bg-white w-full h-16 flex items-center px-8 shadow">
      <Navbar />
    </div>

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-10">
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
              🚀 Aktif Sprint Özeti
            </h1>
            <h2 class="text-lg font-semibold text-gray-700">
              📌 {{ sprint.name }}
            </h2>
            <p class="text-sm text-gray-600">
              Tarih: {{ formatDate(sprint.startDate) }} – {{ formatDate(sprint.endDate) }}
            </p>
            <p class="text-sm text-gray-600">
              Kalan Gün: {{ remainingDays }} gün
            </p>
          </div>

          <div class="space-y-6">
            <SprintBurndownChart :tasks="sprintTasks" />
            <SprintCompletedTasksChart :tasks="sprintTasks" />
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
