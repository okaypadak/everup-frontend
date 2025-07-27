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
            <!-- Proje seçici -->
            <select
                v-model="selectedProject"
                class="px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300 min-w-[220px]"
                @change="loadDocs"
            >
              <option value="" disabled>Proje Seçiniz</option>
              <option v-for="proj in projects" :key="proj.id" :value="proj.id">{{ proj.name }}</option>
            </select>
          </div>

          <template v-if="selectedProject">
            <div class="flex items-center justify-between mb-8">
              <span/>
              <button
                  class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
                  @click="addRootDocument"
              >+ Yeni Ana Döküman</button>
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
import { ref, computed } from 'vue'
import Navbar from '~/pages/components/bar/Navbar.vue'
import { useRouter } from 'vue-router'
import { docsData } from '/dummy/document.js'
import TreeItem from '/pages/components/editor/TreeItem.vue'

const projects = ref([
  { id: 'proj1', name: 'CRM Yazılımı' },
  { id: 'proj2', name: 'E-Ticaret Platformu' },
  { id: 'proj3', name: 'Mobil App' }
])
const allDocs = ref([...docsData])
const selectedProject = ref('')
const user = useState('user')
const router = useRouter()

function loadDocs() {}

function buildTree(list, parentId = null) {
  return list
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: buildTree(list, item.id)
      }))
}

const tree = computed(() =>
    buildTree(allDocs.value.filter(d => d.projectId === selectedProject.value))
)

function openDoc(doc) {
  router.push({ name: 'writer', query: { id: doc.id } })
}

function addRootDocument() {
  if (!selectedProject.value) return
  const id = Date.now()
  allDocs.value.push({
    id,
    parentId: null,
    projectId: selectedProject.value,
    title: 'Yeni Ana Döküman',
    desc: 'Özet girilmedi.',
    content: ''
  })
}
function addChildDocument(parentId) {
  if (!selectedProject.value) return
  const id = Date.now()
  allDocs.value.push({
    id,
    parentId,
    projectId: selectedProject.value,
    title: 'Yeni Alt Döküman',
    desc: 'Alt başlık özeti.',
    content: ''
  })
}
function deleteDocument(id) {
  // Alt başlıkları da dahil tüm ilgili id'leri sil (recursive delete)
  function collectIds(list, idToDelete) {
    let ids = [idToDelete]
    const children = list.filter(doc => doc.parentId === idToDelete)
    for (const child of children) {
      ids = ids.concat(collectIds(list, child.id))
    }
    return ids
  }
  const idsToDelete = collectIds(allDocs.value, id)
  allDocs.value = allDocs.value.filter(doc => !idsToDelete.includes(doc.id))
}
</script>
