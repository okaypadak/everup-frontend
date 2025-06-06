<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
    <div class="max-w-5xl mx-auto px-4 py-10">
      <div class="bg-white p-6 rounded-xl shadow-lg space-y-10">
        <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
          <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m5-4a4 4 0 100-8 4 4 0 000 8zm-6 4a4 4 0 018 0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Proje Katılımcıları
        </h1>

        <!-- Proje Seçimi -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Proje Seç</label>
          <select v-model="selectedProjectId" class="w-full border p-2 rounded-lg">
            <option value="">-- Proje Seçin --</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>

        <!-- Katılımcılar -->
        <div v-if="selectedProject">
          <div v-if="selectedProject.members.length" class="space-y-4 mt-6">
            <div v-for="member in selectedProject.members" :key="member.userId" class="border p-4 rounded-xl shadow-sm">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-lg font-semibold">{{ member.fullName }}</p>
                  <p class="text-sm text-gray-600">Ana Ünvan: {{ member.mainTitle }}</p>
                  <p class="text-sm text-gray-500">Projede Rolü: {{ member.projectRole }}</p>
                </div>
                <button @click="removeMember(member.userId)" class="text-red-500 hover:underline text-sm">❌ Kaldır</button>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 mt-4">Bu projeye henüz katılımcı eklenmemiş.</div>

          <!-- Katılımcı Ekleme -->
          <form @submit.prevent="addMember" class="bg-gray-50 p-4 rounded-xl border space-y-4 mt-6">
            <h2 class="text-lg font-semibold text-sky-700">Yeni Katılımcı Ekle</h2>

            <div>
              <label class="block text-sm font-medium text-gray-700">Kullanıcı Seç</label>
              <select v-model="newMember.userId" class="w-full mt-1 p-2 border rounded-lg">
                <option value="">-- Seçiniz --</option>
                <option v-for="user in allUsers" :value="user.id" :key="user.id">
                  {{ user.fullName }} ({{ user.mainTitle }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Projede Rolü</label>
              <select v-model="newMember.projectRole" class="w-full mt-1 p-2 border rounded-lg">
                <option value="">-- Rol Seçin --</option>
                <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
              </select>
            </div>

            <div class="flex justify-end">
              <button type="submit" class="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition">
                Ekle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '/pages/components/bar/Navbar.vue'
import { ref, computed } from 'vue'

// Projeler
const projects = ref([
  {
    id: 'p1',
    name: 'AI Destekli Gider Defteri',
    members: [
      { userId: 'u1', fullName: 'Ali Veli', mainTitle: 'Yazılım Geliştirici', projectRole: 'Backend' }
    ]
  },
  {
    id: 'p2',
    name: 'CMS Sistem Tasarımı',
    members: []
  }
])

// Seçili proje ID
const selectedProjectId = ref('')

// Kullanıcılar
const allUsers = ref([
  { id: 'u1', fullName: 'Ali Veli', mainTitle: 'Yazılım Geliştirici' },
  { id: 'u2', fullName: 'Ayşe Kaya', mainTitle: 'Test Uzmanı' },
  { id: 'u3', fullName: 'Mehmet Can', mainTitle: 'Frontend Developer' }
])

// Roller
const roles = ['Frontend', 'Backend', 'DevOps', 'Tester', 'Lead']

const newMember = ref({
  userId: '',
  projectRole: ''
})

// Seçili proje verisi
const selectedProject = computed(() => {
  return projects.value.find(p => p.id === selectedProjectId.value)
})

function addMember() {
  if (!selectedProject.value) return alert('Önce proje seçin.')
  const user = allUsers.value.find(u => u.id === newMember.value.userId)
  if (!user || !newMember.value.projectRole) return
  if (selectedProject.value.members.some(m => m.userId === user.id)) return alert('Bu kullanıcı zaten eklendi.')

  selectedProject.value.members.push({
    userId: user.id,
    fullName: user.fullName,
    mainTitle: user.mainTitle,
    projectRole: newMember.value.projectRole
  })

  newMember.value = { userId: '', projectRole: '' }
}

function removeMember(userId) {
  if (!selectedProject.value) return
  selectedProject.value.members = selectedProject.value.members.filter(m => m.userId !== userId)
}
</script>
