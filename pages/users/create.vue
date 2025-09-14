<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">
          <h1 class="text-2xl font-bold text-sky-700">👤 Yeni Kullanıcı Oluştur</h1>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ad</label>
              <input
                  v-model="form.firstName"
                  type="text"
                  placeholder="Ad girin"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50
                       focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
              <input
                  v-model="form.lastName"
                  type="text"
                  placeholder="Soyad girin"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50
                       focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                  v-model="form.email"
                  type="email"
                  placeholder="ornek@mail.com"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50
                       focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                  v-model="form.role"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50
                       focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="" disabled>Rol seçin</option>
                <option v-for="role in roles" :key="role" :value="role">
                  {{ roleLabels[role] }}
                </option>
              </select>
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <button
                @click="createUser"
                class="bg-sky-600 hover:bg-sky-700 text-white font-semibold
                     px-6 py-2 rounded-xl shadow transition"
            >
              Oluştur
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '~/pages/components/bar/Navbar.vue'
import { toast } from 'vue3-toastify'

enum UserRole {
  DEVELOPER = 'developer',
  TESTER = 'tester',
  DIRECTOR = 'director',
  DEVOPS = 'devOps',
  ADMIN = 'admin',
  MARKETER = 'marketer',
}

const roleLabels: Record<UserRole, string> = {
  [UserRole.DEVELOPER]: 'Geliştirici',
  [UserRole.TESTER]: 'Test Uzmanı',
  [UserRole.DIRECTOR]: 'Proje Direktörü',
  [UserRole.DEVOPS]: 'DevOps',
  [UserRole.ADMIN]: 'Yönetici',
  [UserRole.MARKETER]: 'Pazarlamacı',
}

const roles = Object.values(UserRole)

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
      form.value = { firstName: '', lastName: '', email: '', role: '' }
    } else {
      toast.warning(`⚠️ ${response.message}`)
    }
  } catch (err: any) {
    toast.error(`🚫 Sunucu hatası: ${err?.data?.message || err.message}`)
  }
}
</script>
