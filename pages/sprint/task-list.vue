<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-8">
          <h1 class="text-2xl font-bold text-sky-700">🧩 Görevleri Sprint'e Ata</h1>

          <!-- Proje Seç -->
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

          <!-- Aktif Sprint ve Görevler -->
          <div v-if="selectedSprint">
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-gray-800">
                📋 {{ selectedSprint.name }} ({{ selectedSprint.startDate }} - {{ selectedSprint.endDate }})
              </h2>
            </div>

            <!-- Atanmış Görevler -->
            <div>
              <h3 class="text-lg font-medium text-gray-700 mb-2">Atanmış Görevler</h3>
              <ul class="space-y-2">
                <li
                    v-for="task in assignedTasks"
                    :key="task.id"
                    class="bg-green-50 border border-green-200 px-4 py-2 rounded flex justify-between items-center"
                >
                  <span>✅ {{ task.title }}</span>
                  <button
                      class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
                      @click="removeFromSprint(task)"
                  >
                    Sprint'ten Çıkar
                  </button>
                </li>
                <li v-if="assignedTasks.length === 0" class="text-gray-500">
                  Henüz görev atanmadı.
                </li>
              </ul>
            </div>

            <!-- Hazır Görevler -->
            <div class="mt-6">
              <h3 class="text-lg font-medium text-gray-700 mb-2">Hazır Görevler</h3>
              <ul class="space-y-2">
                <li
                    v-for="task in availableTasks"
                    :key="task.id"
                    class="bg-white border px-4 py-2 rounded flex justify-between items-center"
                >
                  <span>📝 {{ task.title }}</span>
                  <button
                      class="bg-sky-600 hover:bg-sky-700 text-white px-4 py-1 rounded text-sm"
                      @click="assignToSprint(task)"
                  >
                    Ata
                  </button>
                </li>
                <li v-if="availableTasks.length === 0" class="text-gray-500">
                  Atanabilir görev kalmadı.
                </li>
              </ul>
            </div>
          </div>
          <div v-else class="py-10 text-center text-gray-400">
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

const projects = [
  { id: '1', name: 'Mobil App Projesi' },
  { id: '2', name: 'Web Panel Geliştirme' }
]

const sprints = [
  { id: 'sp1', name: 'Sprint 1', startDate: '2025-06-01', endDate: '2025-06-15', projectId: '1' },
  { id: 'sp2', name: 'Sprint 2', startDate: '2025-06-16', endDate: '2025-06-30', projectId: '1' },
  { id: 'sp3', name: 'Sprint A', startDate: '2025-06-05', endDate: '2025-06-20', projectId: '2' }
]

const allTasks = ref([
  { id: 1, title: 'Kayıt formu validasyonu', sprintId: null, projectId: '1' },
  { id: 2, title: 'Mobil responsive düzelt', sprintId: null, projectId: '1' },
  { id: 3, title: 'Email bug fix', sprintId: 'sp1', projectId: '1' },
  { id: 4, title: 'Tema değişikliği', sprintId: null, projectId: '2' }
])

const selectedProjectId = ref('')

// Aktif sprint hesaplaması (günün tarihine göre):
const selectedSprint = computed(() => {
  if (!selectedProjectId.value) return null;
  const today = new Date();
  return sprints.find(s =>
      s.projectId === selectedProjectId.value &&
      new Date(s.startDate) <= today &&
      today <= new Date(s.endDate)
  ) || null;
});

// Atanmış görevler
const assignedTasks = computed(() =>
    selectedSprint.value
        ? allTasks.value.filter(t => t.sprintId === selectedSprint.value.id)
        : []
);

// Hazır görevler
const availableTasks = computed(() =>
    selectedSprint.value
        ? allTasks.value.filter(t => !t.sprintId && t.projectId === selectedProjectId.value)
        : []
);

// Görev sprint'e ata
const assignToSprint = (task) => {
  if (selectedSprint.value) {
    task.sprintId = selectedSprint.value.id
  }
}

// Görevi sprint'ten çıkar
const removeFromSprint = (task) => {
  task.sprintId = null
}
</script>
