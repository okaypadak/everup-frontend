<template>
  <div class="p-4 bg-gray-50 rounded shadow space-y-4">
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

onMounted(fetchDocuments)
</script>
