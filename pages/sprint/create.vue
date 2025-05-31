<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navbar -->
    <div class="bg-white w-full h-16 flex items-center px-8 shadow">
      <Navbar />
    </div>

    <!-- İçerik -->
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold text-sky-700 mb-6">🌀 Yeni Sprint Oluştur</h2>

          <form @submit.prevent="submitSprint" class="space-y-6">
            <!-- Sprint Adı -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sprint Adı</label>
              <input
                  v-model="form.name"
                  type="text"
                  placeholder="Örn: Sprint 14 - Haziran"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  required
              />
            </div>

            <!-- Tarihler -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                <input
                    v-model="form.startDate"
                    type="date"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input
                    v-model="form.endDate"
                    type="date"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    required
                />
              </div>
            </div>

            <!-- Sprint Hedefi -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sprint Hedefi (isteğe bağlı)</label>
              <textarea
                  v-model="form.goal"
                  rows="3"
                  placeholder="Bu sprintte yapılacak ana işler..."
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
              />
            </div>

            <!-- Buton -->
            <div class="flex justify-end">
              <button
                  type="submit"
                  class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
              >
                Sprint Oluştur
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'

const emit = defineEmits(['created'])

const form = reactive({
  name: '',
  startDate: '',
  endDate: '',
  goal: ''
})

const submitSprint = () => {
  const newSprint = {
    ...form,
    id: Date.now().toString()
  }

  emit('created', newSprint)

  // Formu sıfırla
  form.name = ''
  form.startDate = ''
  form.endDate = ''
  form.goal = ''
}
</script>
