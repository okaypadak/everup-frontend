<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">

          <!-- 🔖 Başlık ve Proje Seçici -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex items-center gap-2 flex-1">
              <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="13" rx="2" stroke-width="2"/>
                <path d="M16 3v4M8 3v4" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h1 class="text-2xl font-bold text-sky-700">Dökümanlar</h1>
            </div>

            <select
                v-model="selectedProject"
                class="px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300 min-w-[220px]"
                @change="fetchDocuments"
            >
              <option value="" disabled>Proje Seçiniz</option>
              <option v-for="proj in projects" :key="proj.id" :value="proj.id">{{ proj.name }}</option>
            </select>
          </div>

          <!-- Ana Döküman Ekleme -->
          <div v-if="selectedProject" class="flex items-center gap-2">
            <input
                v-model="newRootTitle"
                placeholder="Ana doküman başlığı"
                class="px-3 py-2 border rounded w-full focus:outline-none focus:ring"
            />
            <button
                @click="addRootDocument"
                class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              ➕ Ekle
            </button>
          </div>

          <!-- Döküman Ağacı -->
          <div v-if="selectedProject">
            <TreeItem
                v-for="doc in rootDocuments"
                :key="doc.id"
                :document="doc"
                :all-documents="documents"
                :project-id="selectedProject"
                @refresh="fetchDocuments"
            />

            <div v-if="rootDocuments.length === 0" class="text-gray-400 text-center mt-8">
              Bu projede henüz döküman yok. Yeni ana döküman ekleyin.
            </div>
          </div>

          <div v-else class="text-gray-400 text-center mt-12">
            Proje seçiniz. Dökümanlar burada listelenecek.
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TreeItem from './TreeItem.vue'
import Navbar from '/pages/components/bar/Navbar.vue' // varsa bu satırı tut

const selectedProject = ref('')
const projects = ref([])
const documents = ref([])
const newRootTitle = ref('')

const rootDocuments = computed(() =>
    documents.value.filter(d => d.parentId === null)
)

async function fetchDocuments() {
  if (!selectedProject.value) return
  const res = await $fetch(`/api/documents/project/${selectedProject.value}`)
  documents.value = res || []
}

async function addRootDocument() {
  if (!newRootTitle.value.trim()) return

  await $fetch('/api/documents', {
    method: 'POST',
    body: {
      title: newRootTitle.value,
      parentId: null,
      projectId: Number(selectedProject.value)
    }
  })

  newRootTitle.value = ''
  await fetchDocuments()
}

// Projeleri getir
onMounted(async () => {
  const { data, error } = await useFetch('/api/projects')

  if (!error.value) {
    projects.value = data.value || []
  }
})
</script>
