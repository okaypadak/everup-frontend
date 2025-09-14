<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <!-- Etiket Yönetimi Modal -->
    <div
        v-if="showLabelModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-sky-700">
            {{ selectedProject?.name }} – Etiket Yönetimi
          </h3>
          <button
              @click="showLabelModal = false"
              class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <!-- Etiket Ekleme Formu -->
        <div class="mb-6 flex items-center gap-2">
          <input
              v-model="newLabelName"
              type="text"
              placeholder="Yeni etiket adı"
              class="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <button
              @click="createLabel"
              class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-xl transition"
          >
            Ekle
          </button>
        </div>

        <!-- Etiket Listesi -->
        <h4 class="font-medium text-gray-700 mb-2">Mevcut Etiketler</h4>
        <div v-if="projectLabels.length === 0" class="text-gray-500 text-center py-4">
          Bu projede henüz etiket bulunmuyor.
        </div>
        <div v-else class="space-y-2">
          <div
              v-for="label in projectLabels"
              :key="label.id"
              class="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-lg"
          >
            <span class="text-gray-700">{{ label.name }}</span>
            <button
                @click="deleteLabel(label.id)"
                class="text-red-500 hover:text-red-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <!-- Proje Oluşturma Formu -->
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">
          <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
            <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  d="M12 4v16m8-8H4"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
            Yeni Proje Oluştur
          </h1>

          <form class="space-y-6" @submit.prevent="submitForm">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Proje Adı</label>
              <input
                  v-model="form.title"
                  type="text"
                  required
                  placeholder="Örn: CRM Yenileme"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                  v-model="form.description"
                  rows="4"
                  required
                  placeholder="Proje ile ilgili kısa açıklama..."
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
              <input
                  v-model="form.startDate"
                  type="date"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div class="flex justify-end">
              <button
                  type="submit"
                  class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>

        <!-- Projeler Listesi -->
        <div class="bg-white p-6 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold text-sky-700 mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
            Mevcut Projeler
          </h2>

          <div v-if="projects.length === 0" class="text-gray-500 text-center py-8">
            Henüz proje bulunmuyor.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
                v-for="project in projects"
                :key="project.id"
                class="p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                @click="openLabelModal(project)"
            >
              <div class="font-medium text-lg text-gray-800">{{ project.name }}</div>
              <div class="text-sm text-gray-600 mt-1 line-clamp-2">
                {{ project.description }}
              </div>
              <div class="text-xs text-sky-600 mt-2">
                Başlangıç: {{ new Date(project.startDate).toLocaleDateString('tr-TR') }}
              </div>
              <div class="mt-2 text-xs text-gray-500 italic">
                Etiket eklemek için tıklayın
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '~/pages/components/bar/Navbar.vue'
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'

const form = ref({
  title: '',
  description: '',
  startDate: ''
})

const projects = ref([])
const showLabelModal = ref(false)
const selectedProject = ref(null)
const projectLabels = ref([])
const newLabelName = ref('')

// Tüm projeleri getir
async function fetchProjects() {
  try {
    const response = await $fetch('/api/projects')
    projects.value = response
  } catch (err) {
    console.error('Projeler alınamadı:', err)
    toast.error('Projeler yüklenirken bir hata oluştu')
  }
}

async function submitForm() {
  try {
    const res = await $fetch('/api/projects', {
      method: 'POST',
      body: {
        name: form.value.title,
        description: form.value.description,
        startDate: form.value.startDate,
      },
    })

    if (res.code === '00') {
      toast.success(res.message || '✅ Proje başarıyla oluşturuldu!')
      form.value = { title: '', description: '', startDate: '' }
      // Yeni proje oluşturulduktan sonra projeleri yeniden getir
      await fetchProjects()
    } else {
      toast.error(res.message || '⚠️ Bir hata oluştu')
    }
  } catch (err) {
    toast.error(err?.data?.message || '🚨 Sunucu hatası')
  }
}

// Proje etiketlerini getir
async function fetchProjectLabels(projectId) {
  try {
    const response = await $fetch(`/api/task-labels/${projectId}`)
    projectLabels.value = response
  } catch (err) {
    console.error('Etiketler alınamadı:', err)
    toast.error('Etiketler yüklenirken bir hata oluştu')
  }
}

// Etiket oluştur
async function createLabel() {
  if (!newLabelName.value.trim() || !selectedProject.value) return

  try {
    await $fetch('/api/task-labels', {
      method: 'POST',
      body: {
        projectId: selectedProject.value.id,
        name: newLabelName.value.trim()
      }
    })

    toast.success('Etiket başarıyla oluşturuldu')
    newLabelName.value = ''
    await fetchProjectLabels(selectedProject.value.id)
  } catch (err) {
    console.error('Etiket oluşturulamadı:', err)
    toast.error('Etiket oluşturulurken bir hata oluştu')
  }
}

// Etiket sil
async function deleteLabel(labelId) {
  try {
    await $fetch(`/api/task-labels/${labelId}`, {
      method: 'DELETE'
    })

    toast.success('Etiket başarıyla silindi')
    await fetchProjectLabels(selectedProject.value.id)
  } catch (err) {
    console.error('Etiket silinemedi:', err)
    toast.error('Etiket silinirken bir hata oluştu')
  }
}

// Proje seç ve etiket modalını aç
function openLabelModal(project) {
  selectedProject.value = project
  fetchProjectLabels(project.id)
  showLabelModal.value = true
}

// Sayfa yüklendiğinde projeleri getir
onMounted(() => {
  fetchProjects()
})
</script>
