<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-10">
          <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
            <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m5-4a4 4 0 100-8 4 4 0 000 8zm-6 4a4 4 0 018 0"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Proje Katılımcıları
          </h1>

          <!-- Proje Seçimi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Proje Seç</label>
            <select v-model="selectedProjectId" class="w-full border p-2 rounded-lg">
              <option value="">-- Proje Seçin --</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Katılımcılar -->
          <div v-if="selectedProjectId">
            <div v-if="projectMembers.length" class="space-y-4 mt-6">
              <div v-for="member in projectMembers" :key="member.id" class="border p-4 rounded-xl shadow-sm">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-lg font-semibold">{{ member.firstName }} {{ member.lastName }}</p>
                    <p class="text-sm text-gray-600">{{ member.email }}</p>
                    <p class="text-sm text-gray-500" v-if="member.role">Rol: {{ roleLabel(member.role) }}</p>
                  </div>
                  <button class="text-red-500 hover:underline text-sm" @click="removeMember(member.id)">
                    ❌ Kaldır
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 mt-4">Bu projeye henüz katılımcı eklenmemiş.</div>

            <!-- Katılımcı Ekleme -->
            <form class="bg-gray-50 p-4 rounded-xl border space-y-4 mt-6" @submit.prevent="addMember">
              <h2 class="text-lg font-semibold text-sky-700">Yeni Katılımcı Ekle</h2>

              <div>
                <label class="block text-sm font-medium text-gray-700">Kullanıcı Seç</label>
                <select v-model="newMember.userId" class="w-full mt-1 p-2 border rounded-lg">
                  <option value="">-- Seçiniz --</option>
                  <option v-for="user in allUsers" :key="user.id" :value="user.id">
                    {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Projede Rolü</label>
                <select v-model="newMember.role" class="w-full mt-1 p-2 border rounded-lg">
                  <option value="">-- Rol Seçin --</option>
                  <option v-for="role in roles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
              </div>

              <div class="flex justify-end">
                <button type="submit" class="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition">
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '/pages/components/bar/Navbar.vue'
import { ref, watch, onMounted } from 'vue'
import { useFetch } from '#app'
import { toast } from 'vue3-toastify'

const projects = ref([])
const allUsers = ref([])
const selectedProjectId = ref('')
const projectMembers = ref([])

const newMember = ref({ userId: '', role: '' })

// ✅ ProjectRole + UserRole birleşik ve etiketli gösterim
const roles = [
  { value: 'developer', label: 'Geliştirici' },
  { value: 'team_lead', label: 'Takım Lideri' },
  { value: 'tester', label: 'Test Uzmanı' },
  { value: 'manager', label: 'Yönetici' },
  { value: 'desinger', label: 'Tasarımcı' },
  { value: 'devOps', label: 'DevOps' },
  { value: 'marketer', label: 'Pazarlamacı' },
  { value: 'admin', label: 'Admin' },
  { value: 'director', label: 'Direktör' }
]

// 🔁 Rol kodunu etikete çeviren yardımcı fonksiyon
function roleLabel(role) {
  const match = roles.find(r => r.value === role)
  return match ? match.label : role
}

onMounted(async () => {
  try {
    const { data: projectData } = await useFetch('/api/projects')
    projects.value = projectData.value || []
  } catch (err) {
    toast.error('Projeler alınamadı')
  }

  try {
    const { data: userData } = await useFetch('/api/users')
    allUsers.value = userData.value || []
  } catch (err) {
    toast.error('Kullanıcılar alınamadı')
  }
})

watch(selectedProjectId, async (id) => {
  if (!id) return (projectMembers.value = [])
  await reloadMembers()
})

async function reloadMembers() {
  try {
    const { data } = await useFetch(`/api/projects/${selectedProjectId.value}/users`)
    projectMembers.value = data.value?.members || []
  } catch (err) {
    toast.error('Katılımcılar getirilemedi')
    projectMembers.value = []
  }
}

async function addMember() {
  if (!selectedProjectId.value || !newMember.value.userId || !newMember.value.role) {
    return toast.warn('Lütfen kullanıcı ve rol seçin.')
  }

  try {
    await useFetch(`/api/projects/${selectedProjectId.value}/assign-user`, {
      method: 'POST',
      body: {
        userId: newMember.value.userId,
        role: newMember.value.role
      }
    })

    toast.success('Kullanıcı başarıyla atandı')
    newMember.value = { userId: '', role: '' }
    await reloadMembers()
  } catch (err) {
    toast.error('Atama başarısız oldu')
  }
}

async function removeMember(userId) {
  if (!selectedProjectId.value) return

  try {
    await useFetch(`/api/projects/${selectedProjectId.value}/users/${userId}`, {
      method: 'DELETE'
    })

    toast.success('Kullanıcı projeden kaldırıldı')
    await reloadMembers()
  } catch (err) {
    toast.error('Kaldırma işlemi başarısız oldu')
  }
}
</script>
