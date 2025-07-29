<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-8">
          <h2 class="text-2xl font-bold text-sky-700">🧑‍💼 Kullanıcı Rolleri</h2>

          <div v-for="user in users" :key="user.id" class="border p-4 rounded-lg bg-blue-50 shadow-sm space-y-2">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-semibold text-lg text-gray-800">{{ user.firstName }} {{ user.lastName }}</p>
                <p class="text-sm text-gray-600">{{ user.email }}</p>
              </div>

              <div class="flex items-center gap-3">
                <select
                    v-model="user.role"
                    class="px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option v-for="role in roles" :key="role" :value="role">
                    {{ role }}
                  </option>
                </select>

                <button
                    @click="updateRole(user)"
                    class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-xl transition"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'
import { toast } from 'vue3-toastify'
import { useFetch } from '#app'

const users = ref([])
const roles = ['admin', 'developer', 'tester', 'director', 'devOps', 'marketer']

const fetchUsers = async () => {
  try {
    const { data } = await useFetch('/api/users')
    users.value = data.value
  } catch (err) {
    toast.error('Kullanıcılar yüklenemedi')
  }
}

const updateRole = async (user) => {
  try {
    await $fetch(`/api/users/${user.id}/role`, {
      method: 'PATCH',
      body: { role: user.role }
    })
    toast.success(`Rol güncellendi: ${user.role}`)
  } catch (err) {
    toast.error('Rol güncellenemedi')
  }
}

onMounted(fetchUsers)
</script>
