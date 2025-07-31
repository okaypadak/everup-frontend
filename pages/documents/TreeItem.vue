<template>
  <div class="ml-4 border-l pl-3 border-gray-300 space-y-1">
    <!-- Mevcut başlık ve aksiyonlar -->
    <div class="flex items-center justify-between group">
      <div class="text-gray-800 font-medium">{{ document.title }}</div>

      <!-- Butonlar -->
      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <!-- ➕ Alt başlık -->
        <button
            @click="showInput = !showInput"
            class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
        >
          + Alt Başlık
        </button>

        <!-- 🗑 Sil -->
        <button
            @click="onDelete(document.id)"
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
          class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring"
      />
    </div>

    <!-- 🔁 Alt başlıklar -->
    <TreeItem
        v-for="child in children"
        :key="child.id"
        :document="child"
        :all-documents="allDocuments"
        @add="emit('add', $event)"
        @delete="emit('delete', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  document: Object,
  allDocuments: Array
})
const emit = defineEmits(['add', 'delete'])

const showInput = ref(false)
const newTitle = ref('')

// Alt başlıklar
const children = computed(() =>
    props.allDocuments.filter(doc => doc.parentId === props.document.id)
)

// ➕ Alt başlık ekleme
function addChild() {
  if (!newTitle.value.trim()) return
  emit('add', { parentId: props.document.id, title: newTitle.value })
  newTitle.value = ''
  showInput.value = false
}

// 🗑 Silme
function onDelete(id) {
  emit('delete', id)
}
</script>
