<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-10">
          <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
            🚀 Aktif Sprint Özeti
          </h1>
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
          <div v-if="selectedSprint">
            <div class="space-y-2">
              <h2 class="text-lg font-semibold text-gray-700">
                📌 {{ selectedSprint.name }}
              </h2>
              <p class="text-sm text-gray-600">
                Tarih: {{ formatDate(selectedSprint.startDate) }} – {{ formatDate(selectedSprint.endDate) }}
              </p>
              <p class="text-sm text-gray-600">
                Kalan Gün: {{ remainingDays }} gün
              </p>
            </div>
            <div class="space-y-6 mt-6">
              <SprintBurndownChart :tasks="selectedSprintTasks" />
              <SprintCompletedTasksChart :tasks="selectedSprintTasks" />
            </div>
          </div>
          <div v-else class="py-6 text-center text-gray-400">
            Aktif sprint yok
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
import SprintBurndownChart from '../components/sprint/SprintBurndownChart.vue'
import SprintCompletedTasksChart from '../components/sprint/SprintCompletedBarChart.vue'

const projects = [
  { id: '1', name: 'Mobil App Projesi' },
  { id: '2', name: 'Web Panel' }
]

const sprints = [
  { id: 'sprint-14', name: 'Sprint 14 - Haziran', startDate: '2025-05-29', endDate: '2025-06-14', projectId: '1' },
  { id: 'sprint-15', name: 'Sprint 15 - Temmuz', startDate: '2025-06-20', endDate: '2025-07-05', projectId: '1' },
  { id: 'sprint-A', name: 'Sprint A', startDate: '2025-06-01', endDate: '2025-06-15', projectId: '2' }
]

const allTasks = [
  { id: 1, sprintId: 'sprint-14', title: 'Kayıt formu validasyon hatası', status: 'Tamamlandı' },
  { id: 2, sprintId: 'sprint-14', title: 'Mobil görünüm test et', status: 'Devam' },
  { id: 3, sprintId: 'sprint-14', title: "Email doğrulama bug'ı düzelt", status: 'Tamamlandı' },
  { id: 4, sprintId: 'sprint-14', title: 'Yönlendirme kontrolü', status: 'Devam' },
  { id: 5, sprintId: 'sprint-14', title: 'Mobil tuş tepkisizliği', status: 'Bekliyor' },
  { id: 6, sprintId: 'sprint-14', title: 'Şifre sıfırlama testi', status: 'Tamamlandı' },
  { id: 7, sprintId: 'sprint-14', title: 'Profil düzenleme bug', status: 'Tamamlandı' },
  { id: 8, sprintId: 'sprint-14', title: 'Yeni kullanıcı yönlendirmesi', status: 'Tamamlandı' },
  { id: 9, sprintId: 'sprint-15', title: 'Push bildirim hatası', status: 'Devam' },
  { id: 10, sprintId: 'sprint-A', title: 'Admin panel güncelleme', status: 'Bekliyor' }
]

const selectedProjectId = ref('')

// Bugünün tarihine göre otomatik sprint seçimi:
const selectedSprint = computed(() => {
  if (!selectedProjectId.value) return null;
  const today = new Date();
  return sprints.find(s =>
      s.projectId === selectedProjectId.value &&
      new Date(s.startDate) <= today &&
      today <= new Date(s.endDate)
  ) || null;
});

const selectedSprintTasks = computed(() =>
    selectedSprint.value
        ? allTasks.filter(t => t.sprintId === selectedSprint.value.id)
        : []
);

const formatDate = (dateStr) => {
  const options = { day: '2-digit', month: 'short', year: 'numeric' }
  return new Date(dateStr).toLocaleDateString('tr-TR', options)
}

const remainingDays = computed(() => {
  if (!selectedSprint.value) return 0;
  const today = new Date();
  const end = new Date(selectedSprint.value.endDate);
  const diff = end.getTime() - today.getTime();
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
});
</script>
