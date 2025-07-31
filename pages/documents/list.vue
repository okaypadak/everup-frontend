<template>
  <div class="p-4 bg-gray-50 rounded shadow space-y-4">

    <!-- Başlık ve Proje Seçici -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
      <div class="flex items-center gap-2 flex-1">
        <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="8" width="18" height="13" rx="2" stroke-width="2"/>
          <path d="M16 3v4M8 3v4" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h1 class="text-2xl font-bold text-sky-700">Dökümanlar</h1>
      </div>

      <!-- Proje Seçici -->
      <select
          v-model="selectedProject"
          class="px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300 min-w-[220px]"
          @change="loadDocs"
      >
        <option value="" disabled>Proje Seçiniz</option>
        <option v-for="proj in projects" :key="proj.id" :value="proj.id">{{ proj.name }}</option>
      </select>
    </div>


    <!-- 📌 Ana Doküman Ekleme Alanı -->
    <div class="flex items-center gap-2">
      <input
          v-model="newRootTitle"
          placeholder="Ana doküman başlığı"
          class="px-3 py-2 border rounded w-full focus:outline-none focus:ring"
      />
      <button
          @click="addRootDocument"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ Ekle
      </button>
    </div>

    <!-- 🌳 Doküman Ağacı -->
    <TreeItem
        v-for="doc in rootDocuments"
        :key="doc.id"
        :document="doc"
        :all-documents="documents"
        :project-id="projectId"
        @refresh="fetchDocuments"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TreeItem from './TreeItem.vue'

const route = useRoute()
const projectId = 1

const documents = ref([])
const projects = ref([])
const newRootTitle = ref('')

const rootDocuments = computed(() =>
    documents.value.filter(d => d.parentId === null)
)

async function fetchDocuments() {
  const res = await $fetch(`/api/documents/project/${projectId}`)
  documents.value = res || []
}

async function addRootDocument() {
  if (!newRootTitle.value.trim()) return

  await $fetch('/api/documents', {
    method: 'POST',
    body: {
      title: newRootTitle.value,
      parentId: null,
      projectId: Number(projectId)
    }
  })

  newRootTitle.value = ''
  await fetchDocuments()
}


// Projeleri çek
onMounted(async () => {
  const { data, error } = await useFetch('/api/projects')

  if (error.value) {
    return
  }

  projects.value = data.value || []
})

onMounted(fetchDocuments)
</script>
