<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFetch } from '#app'
import TipTap from '/pages/components/editor/TipTap.vue'
import Navbar from '~/pages/components/bar/Navbar.vue'
import Footer from '~/pages/components/bar/Footer.vue'
import CkEditor from "~/pages/components/editor/CkEditor.vue";

const route = useRoute()
const doc = ref({ id: '', title: '', desc: '', content: '' })
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

onMounted(async () => {
  const id = route.params.id
  if (!id) return

  const { data, error } = await useFetch(`/api/documents/${id}`)

  if (error.value) {
    console.error('Döküman yüklenemedi:', error.value)
    return
  }

  if (data.value) {
    doc.value = {
      id: data.value.id || '',
      title: data.value.title || '',
      desc: data.value.desc || '',
      content: data.value.content || ''
    }
  }
})

async function updateDocument() {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const { error } = await useFetch(`/api/documents/${doc.value.id}`, {
      method: 'PATCH',
      body: {
        title: doc.value.title,
        desc: doc.value.desc,
        content: doc.value.content
      }
    })

    if (error.value) throw error.value
    successMessage.value = '✅ Döküman başarıyla güncellendi.'
  } catch (err) {
    console.error('Güncelleme hatası:', err)
    errorMessage.value = '❌ Güncelleme sırasında hata oluştu.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg">
          <!-- Toolbar -->
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
              <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="13" rx="2" stroke-width="2"/>
                <path d="M16 3v4M8 3v4" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Döküman Yaz
            </h1>
            <div class="flex gap-2">
              <button @click="updateDocument" :disabled="loading" class="px-5 py-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow transition">
                {{ loading ? 'Kaydediliyor...' : 'Kaydet' }}
              </button>
              <button class="px-5 py-2 rounded-2xl bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 font-medium shadow transition">Önizle</button>
            </div>
          </div>

          <input v-model="doc.title" type="text" placeholder="Başlık..." class="w-full text-3xl font-extrabold border-0 border-b-2 border-sky-100 focus:border-sky-500 bg-transparent px-1 mb-3 py-3 outline-none transition text-black">
          <input v-model="doc.desc" type="text" placeholder="Özet (isteğe bağlı)..." class="w-full text-lg font-medium border-0 border-b border-gray-100 focus:border-sky-500 bg-transparent px-1 mb-8 py-2 outline-none transition text-black">
          <CkEditor v-model="doc.content" class="ProseMirror-Word" />

          <p v-if="successMessage" class="text-green-600 mt-4">{{ successMessage }}</p>
          <p v-if="errorMessage" class="text-red-600 mt-4">{{ errorMessage }}</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
