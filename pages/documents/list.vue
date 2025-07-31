<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
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

          <!-- Dökümanlar -->
          <template v-if="selectedProject">
            <div class="flex items-center justify-between mb-8">
              <span />
              <button
                  class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
                  @click="addRootDocument"
              >
                + Yeni Ana Döküman
              </button>
            </div>

            <ul>
              <TreeItem
                  v-for="node in tree"
                  :key="node.id"
                  :node="node"
                  @open="openDoc"
                  @add-child="addChildDocument"
                  @delete="deleteDocument"
              />
            </ul>

            <div v-if="tree.length === 0" class="text-gray-400 text-center mt-8">
              Bu projede henüz döküman yok. Yeni ana döküman ekleyin.
            </div>
          </template>

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
import { useFetch } from '#app'
import { useRouter } from 'vue-router'
import Navbar from '~/pages/components/bar/Navbar.vue'
import TreeItem from '~/pages/documents/TreeItem.vue'

const router = useRouter()
const selectedProject = ref('')
const projects = ref([])
const allDocs = ref([])

// Projeleri çek
onMounted(async () => {
  const { data, error } = await useFetch('/api/projects')

  if (error.value) {
    return
  }

  projects.value = data.value || []
})

// Seçili projeye ait dökümanları çek
async function loadDocs() {
  if (!selectedProject.value) {
    return
  }

  const { data, error } = await useFetch(`/api/documents/project/${selectedProject.value}`)

  if (error.value) {
    return
  }

  allDocs.value = Array.isArray(data.value) ? data.value : []
}

// Ağaç yapısını oluştur
function buildTree(list, parentId = null, visited = new Set()) {
  return list
      .filter(item => item.parentId === parentId)
      .map(item => {
        if (visited.has(item.id)) {
          return null
        }

        // Bu node'u işaretle
        const newVisited = new Set(visited)
        newVisited.add(item.id)

        return {
          ...item,
          children: buildTree(list, item.id, newVisited)
        }
      })
      .filter(Boolean)
}

const tree = computed(() => {
  const selectedId = String(selectedProject.value)
  const filtered = allDocs.value.filter(d => String(d.projectId) === selectedId)
  return buildTree(filtered)
})

// Dökümanı aç
function openDoc(doc) {
  router.push({ name: 'writer', query: { id: doc.id } })
}

// Yeni ana döküman ekle
async function addRootDocument() {
  if (!selectedProject.value) return

  const payload = {
    projectId: selectedProject.value,
    title: 'Yeni Ana Döküman',
    desc: 'Özet girilmedi.',
    content: ''
  }

  try {
    const response = await $fetch('/api/documents', {
      method: 'POST',
      body: payload
    })

    // Backend'den dönen doküman (ID dahil) listeye ekleniyor
    allDocs.value.push(response)
  } catch (error) {
    // Error handling could be improved here
  }
}

// Yeni alt döküman ekle
async function addChildDocument(parentId) {
  if (!selectedProject.value) return
  
  const payload = {
    parentId,
    projectId: selectedProject.value,
    title: 'Yeni Alt Döküman',
    desc: 'Alt başlık özeti.',
    content: ''
  }
  
  try {
    const response = await $fetch('/api/documents', {
      method: 'POST',
      body: payload
    })
    
    // Backend'den dönen doküman (ID dahil) listeye ekleniyor
    allDocs.value.push(response)
  } catch (error) {
    console.error('Alt döküman eklenirken hata oluştu:', error)
  }
}

// Döküman (ve çocuklarını) sil
async function deleteDocument(id) {
  function collectIds(list, idToDelete) {
    let ids = [idToDelete]
    const children = list.filter(doc => doc.parentId === idToDelete)
    for (const child of children) {
      ids = ids.concat(collectIds(list, child.id))
    }
    return ids
  }

  const idsToDelete = collectIds(allDocs.value, id)
  
  // Remove from local state
  allDocs.value = allDocs.value.filter(doc => !idsToDelete.includes(doc.id))
}

</script>
