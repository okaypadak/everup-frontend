<template>
  <div class="p-4 bg-gray-50 rounded shadow">
    <TreeItem
        v-for="doc in rootDocuments"
        :key="doc.id"
        :document="doc"
        :all-documents="documents"
        @add="handleAdd"
        @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TreeItem from './TreeItem.vue'

const documents = ref([
  { id: 1, parentId: null, title: 'Ana Doküman 1' },
  { id: 2, parentId: 1, title: 'Alt Doküman 1.1' },
  { id: 3, parentId: 1, title: 'Alt Doküman 1.2' }
])

// Ana (root) dokümanları getir
const rootDocuments = computed(() =>
    documents.value.filter(doc => doc.parentId === null)
)

// Alt başlık ekle
function handleAdd({ parentId, title }) {
  const newId = Math.max(...documents.value.map(d => d.id)) + 1
  documents.value.push({ id: newId, parentId, title })
}

// Sil
function handleDelete(id) {
  // Recursive olarak alt başlıkları da sil
  const deleteRecursive = (targetId) => {
    const toDelete = documents.value.filter(doc => doc.parentId === targetId)
    toDelete.forEach(child => deleteRecursive(child.id))
    documents.value = documents.value.filter(doc => doc.id !== targetId)
  }

  deleteRecursive(id)
}
</script>
