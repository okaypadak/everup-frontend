<template>
  <div class="min-h-screen flex flex-col bg-gray-50">

      <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg">
          <!-- Toolbar ve başlık -->
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
              <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="13" rx="2" stroke-width="2"/>
                <path d="M16 3v4M8 3v4" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Döküman Yaz
            </h1>
            <div class="flex gap-2">
              <button class="px-5 py-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow transition">Kaydet</button>
              <button class="px-5 py-2 rounded-2xl bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 font-medium shadow transition">Önizle</button>
            </div>
          </div>
          <!-- Başlık -->
          <input
              v-model="doc.title"
              type="text"
              placeholder="Başlık..."
              class="w-full text-3xl font-extrabold border-0 border-b-2 border-sky-100 focus:border-sky-500 bg-transparent px-1 mb-3 py-3 outline-none transition"
          >
          <!-- Özet -->
          <input
              v-model="doc.desc"
              type="text"
              placeholder="Özet (isteğe bağlı)..."
              class="w-full text-lg font-medium border-0 border-b border-gray-100 focus:border-sky-500 bg-transparent px-1 mb-8 py-2 outline-none transition text-gray-500"
          >
          <!-- Editör Alanı -->
          <div class="flex-1 flex flex-col">
            <div class="flex-1">
              <EditorWrapper
                  class="ProseMirror-Word"
                  :initial-content="doc.content"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import EditorWrapper from '/pages/components/editor/EditorWrapper.vue'
import Navbar from '~/pages/components/bar/Navbar.vue'
import Footer from '~/pages/components/bar/Footer.vue'

// Ayrı JSON dosyasından veya objesinden import ediliyor gibi:
import { docsData } from '~/dummy/document.js' // path'i senin dosya yapına göre ayarla

const route = useRoute()
const doc = ref({ id: '', title: '', desc: '', content: '' })

onMounted(() => {
  const id = route.query.id || ''
  // Gerçek hayatta API call da olur.
  const found = docsData.find(d => String(d.id) === String(id))
  if (found) {
    doc.value = { ...found }
  }
})
</script>

<style scoped>
.ProseMirror-Word :deep(.ProseMirror) {
  min-height: 650px;
  max-height: 1200px;
  font-size: 1.12rem;
  padding: 2rem 3rem;
  background: transparent;
  border: none;
  box-shadow: none;
  outline: none;
  height: 500px;
  line-height: 1.7;
  font-family: 'Segoe UI', 'Calibri', 'Arial', sans-serif;
}
</style>
