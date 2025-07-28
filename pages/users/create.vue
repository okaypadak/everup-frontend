<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navbar -->
    <Navbar />

    <!-- İçerik -->
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">
          <h1 class="text-3xl font-bold text-sky-700">👤 Yeni Kullanıcı Oluştur</h1>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ad</label>
              <input v-model="form.firstName" type="text" class="input" placeholder="Ad girin" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
              <input v-model="form.lastName" type="text" class="input" placeholder="Soyad girin" />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input v-model="form.email" type="email" class="input" placeholder="ornek@mail.com" />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select v-model="form.role" class="input">
                <option value="" disabled>Rol seçin</option>
                <option value="admin">Yönetici</option>
                <option value="director">Proje Direktörü</option>
                <option value="developer">Geliştirici</option>
                <option value="tester">Testçi</option>
                <option value="lead">Takım Lideri</option>
              </select>
            </div>
          </div>

          <div class="pt-4">
            <button
                class="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow"
                @click="createUser"
            >
              Oluştur
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '~/pages/components/bar/Navbar.vue'
import { toast } from 'vue3-toastify'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: ''
})

const createUser = async () => {

  try {
    const response = await $fetch('/api/users/create', {
      method: 'POST',
      body: form.value
    })

    if (response.code === '00') {
      toast.success('✅ Kullanıcı başarıyla oluşturuldu')
      form.value = {
        firstName: '',
        lastName: '',
        email: '',
        role: ''
      }
    } else {
      toast.warning(`⚠️ ${response.message}`)
    }
  } catch (err) {
    toast.error(`🚫 Sunucu hatası: ${err?.data?.message || err.message}`)
  }
}

</script>

<style scoped>
@reference 'tailwindcss';

.input {
  @apply w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300;
}
</style>
