<template>
  <div class="ml-4 border-l pl-3 border-gray-300 space-y-1">
    <div class="flex items-center justify-between group">
      <!-- Başlık kısmı yönlendirme için router-link oldu -->
      <NuxtLink
          :to="`writer/${document.id}`"
          class="text-gray-800 font-medium hover:underline"
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
          class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring"
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

const props = defineProps({
  document: Object,
  allDocuments: Array
})
const emit = defineEmits(['refresh'])

const showInput = ref(false)
const newTitle = ref('')

const children = computed(() =>
    props.allDocuments.filter(doc => doc.parentId === props.document.id)
)

async function addChild() {
  const title = newTitle.value.trim()

  console.log('🎯 Alt başlık ekleme başladı...')
  console.log('📥 Girilen başlık:', title)

  if (!title) {
    console.warn('⚠️ Başlık boş, işlem durduruldu.')
    return
  }

  const payload = {
    title,
    parentId: props.document.id,
    projectId: 1
  }

  console.log('📦 Sunucuya gönderilecek payload:', payload)

  try {
    const result = await $fetch('/api/documents', {
      method: 'POST',
      body: payload
    })

    console.log('✅ Sunucudan gelen cevap:', result)

    newTitle.value = ''
    showInput.value = false
    emit('refresh')

    console.log('🔄 refresh emit edildi')
  } catch (err) {
    console.error('❌ Sunucuya ekleme sırasında hata oluştu:', err)
  }
}


async function deleteDocument() {
  await $fetch(`/api/documents/${props.document.id}`, {
    method: 'DELETE'
  })
  emit('refresh')
}
</script>
