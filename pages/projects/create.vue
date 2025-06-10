<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-10">
          <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Yeni Proje Oluştur
          </h1>

          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Proje Adı</label>
              <input v-model="form.title" type="text" required class="w-full mt-1 p-2 border rounded-lg" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea v-model="form.description" rows="4" class="w-full mt-1 p-2 border rounded-lg"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
              <input v-model="form.startDate" type="date" class="w-full mt-1 p-2 border rounded-lg" />
            </div>

            <div class="flex justify-end">
              <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-xl transition">
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '/pages/components/bar/Navbar.vue'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

const form = ref({
  title: '',
  description: '',
  startDate: ''
})

function submitForm() {
  toast.success('Proje başarıyla oluşturuldu!')
}
</script>
