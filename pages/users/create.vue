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
              <UiLabel>Ad</UiLabel>
              <UiInput v-model="form.firstName" type="text" placeholder="Ad girin" />
            </div>

            <div>
              <UiLabel>Soyad</UiLabel>
              <UiInput v-model="form.lastName" type="text" placeholder="Soyad girin" />
            </div>

            <div class="sm:col-span-2">
              <UiLabel>E-posta</UiLabel>
              <UiInput v-model="form.email" type="email" placeholder="ornek@mail.com" />
            </div>

            <div class="sm:col-span-2">
              <UiLabel>Rol</UiLabel>
              <UiSelect v-model="form.role">
                <option value="" disabled>Rol seçin</option>
                <option
                    v-for="role in roles"
                    :key="role"
                    :value="role"
                >
                  {{ roleLabels[role] }}
                </option>
              </UiSelect>
            </div>
          </div>

          <div class="pt-4">
            <UiButton @click="createUser">Oluştur</UiButton>
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

// Enum roller
enum UserRole {
  DEVELOPER = 'developer',
  TESTER = 'tester',
  DIRECTOR = 'director',
  DEVOPS = 'devOps',
  ADMIN = 'admin',
  MARKETER = 'marketer',
}

// Kullanıcıya görünmesini istediğimiz etiketler
const roleLabels: Record<UserRole, string> = {
  [UserRole.DEVELOPER]: 'Geliştirici',
  [UserRole.TESTER]: 'Testçi',
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
      form.value = {
        firstName: '',
        lastName: '',
        email: '',
        role: ''
      }
    } else {
      toast.warning(`⚠️ ${response.message}`)
    }
  } catch (err: any) {
    toast.error(`🚫 Sunucu hatası: ${err?.data?.message || err.message}`)
  }
}
</script>
