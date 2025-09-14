<template>
  <div class="ml-4 border-l pl-3 border-gray-300 space-y-1">
    <div class="flex items-center justify-between group">
      <!-- Başlık kısmı yönlendirme için router-link oldu -->
      <NuxtLink
          :to="`/documents/writer/${document.id}`"
          class="text-black font-medium hover:underline"
      >
        {{ document.title }}
      </NuxtLink>

      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
            @click="showInput = !showInput"
            class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
        >
          + Alt Başlık
        </button>
        <button
            @click="deleteDocument"
            class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
        >
          🗑 Sil
        </button>
      </div>
    </div>

    <!-- ➕ Alt başlık inputu -->
    <div v-if="showInput" class="ml-2">
      <input
          v-model="newTitle"
          @keydown.enter="addChild"
          placeholder="Alt başlık yazın ve Enter’a basın"
          class="w-full px-2 py-1 text-sm border rounded text-black focus:outline-none focus:ring"
      />
    </div>

    <TreeItem
        v-for="child in children"
        :key="child.id"
        :document="child"
        :all-documents="allDocuments"
        @refresh="$emit('refresh')"
    />
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'

const props = defineProps({
  document: Object,
  allDocuments: Array
})
const emit = defineEmits(['refresh'])

const showInput = ref(false)
const newTitle = ref('')

const projectStore = useProjectStore()

const children = computed(() =>
    props.allDocuments.filter(doc => doc.parentId === props.document.id)
)

async function addChild() {
  const title = newTitle.value.trim()

  if (!title) return

  const payload = {
    title,
    parentId: props.document.id,
    projectId: projectStore.selectedProjectId,
  }

  try {
    await $fetch('/api/documents', {
      method: 'POST',
      body: payload,
    })
    newTitle.value = ''
    showInput.value = false
    emit('refresh')
  } catch (err) {
    console.error('❌ Alt başlık eklenemedi:', err)
  }
}

async function deleteDocument() {
  try {
    await $fetch(`/api/documents/${props.document.id}`, {
      method: 'DELETE',
    })
    emit('refresh')
  } catch (err) {
    console.error('❌ Döküman silinemedi:', err)
  }
}
</script>