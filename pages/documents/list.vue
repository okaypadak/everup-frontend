<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">

          <!-- 🔖 Başlık ve aktif proje özeti -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex items-center gap-2 flex-1">
              <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="13" rx="2" stroke-width="2" />
                <path d="M16 3v4M8 3v4" stroke-width="2" stroke-linecap="round" />
              </svg>
              <h1 class="text-2xl font-bold text-sky-700">Dökümanlar</h1>
            </div>

            <div class="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 min-w-[240px]">
              <p class="text-xs uppercase tracking-wide text-slate-500">Aktif Proje</p>
              <p v-if="projectStore.selectedProjectName" class="font-semibold text-slate-800">
                {{ projectStore.selectedProjectName }}
              </p>
              <p v-else class="text-slate-500">
                Görevler panelinden proje seçin.
              </p>
            </div>
          </div>

          <!-- Ana Döküman Ekleme -->
          <div v-if="hasActiveProject" class="flex items-center gap-2">
            <input
                v-model="newRootTitle"
                placeholder="Ana doküman başlığı"
                class="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-black
                     focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
            />
            <button
                @click="addRootDocument"
                class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
            >
              ➕ Ekle
            </button>
          </div>

          <!-- Döküman Ağacı -->
          <div v-if="hasActiveProject">
            <TreeItem
                v-for="doc in rootDocuments"
                :key="doc.id"
                :document="doc"
                :all-documents="documents"
                :project-id="projectStore.selectedProjectId"
                @refresh="fetchDocuments"
            />

            <div v-if="rootDocuments.length === 0" class="text-black text-center mt-8">
              Bu projede henüz döküman yok. Yeni ana döküman ekleyin.
            </div>
          </div>

          <div v-else class="text-black text-center mt-12">
            Projenizi Görevler panelinden seçtiğinizde dökümanlar burada listelenir.
          </div>

        </div>
      </div>
    </main>
  </div>
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import TreeItem from './TreeItem.vue'
import Navbar from '/pages/components/bar/Navbar.vue'
import { useProjectStore } from '@/stores/projectStore'

const projectStore = useProjectStore()

const documents = ref([])
const newRootTitle = ref('')

const rootDocuments = computed(() =>
    documents.value.filter(d => d.parentId === null)
)
const hasActiveProject = computed(() => !!projectStore.selectedProjectId)

async function fetchDocuments() {
  if (!projectStore.selectedProjectId) return
  const res = await $fetch(`/api/documents/project/${projectStore.selectedProjectId}`)
  documents.value = res || []
}

async function addRootDocument() {
  if (!newRootTitle.value.trim()) return

  await $fetch('/api/documents', {
    method: 'POST',
    body: {
      title: newRootTitle.value,
      parentId: null,
      projectId: Number(projectStore.selectedProjectId)
    }
  })

  newRootTitle.value = ''
  await fetchDocuments()
}

watch(
  () => projectStore.selectedProjectId,
  async (projectId) => {
    if (!projectId) {
      documents.value = []
      return
    }
    await fetchDocuments()
  },
  { immediate: true }
)
</script>
