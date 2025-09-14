<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-6xl mx-auto px-4 py-10">

        <!-- Proje Seçimi -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Proje Seç</label>
          <select v-model="selectedProjectId" @change="fetchCustomers" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50">
            <option value="" disabled selected>Bir proje seçin</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>

        <!-- Müşteri Ekleme Formu -->
        <div v-if="selectedProjectId" class="bg-white p-6 rounded-xl shadow-lg mb-10">
          <h2 class="text-2xl font-bold text-sky-700 mb-6">🧾 Yeni Müşteri Kaydı</h2>
          <form class="space-y-6" @submit.prevent="submitCustomer">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Firma Adı</label>
              <input v-model="form.firmaAdi" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 text-black" required >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Yetkili Kişi</label>
              <input v-model="form.yetkiliKisi" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 text-black" required >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="form.email" type="email" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 text-black" >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input v-model="form.telefon" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 text-black" >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
              <textarea v-model="form.notlar" rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 resize-none text-black" />
            </div>
            <div class="flex justify-end">
              <button type="submit" class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded-xl shadow">
                Müşteri Kaydet
              </button>
            </div>
          </form>
        </div>

        <!-- Arama ve Ekleme -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="Müşteri ara..."
              class="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <button class="bg-sky-600 text-white px-5 py-2 rounded-lg shadow hover:bg-sky-700">
            + Müşteri bul
          </button>
        </div>

        <!-- Kayıtlı Müşteriler -->
        <div class="mt-12">
          <h2 class="text-xl font-bold text-gray-700 mb-4">📋 Kayıtlı Müşteriler</h2>
          <div v-if="filteredCustomers.length" class="grid md:grid-cols-2 gap-4">
            <div v-for="customer in filteredCustomers" :key="customer.id" @click="selectCustomer(customer)" class="p-4 rounded-xl bg-white shadow border cursor-pointer hover:border-sky-500">
              <h3 class="text-lg font-semibold text-sky-700">{{ customer.firmaAdi }}</h3>
              <p class="text-sm text-gray-600">Yetkili: {{ customer.yetkiliKisi }}</p>
              <p class="text-sm text-gray-500">Email: {{ customer.email }}</p>
              <p class="text-sm text-gray-500">Telefon: {{ customer.telefon }}</p>
              <p class="text-sm text-gray-400 mt-2 italic">{{ customer.notlar }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 italic mt-4">Henüz müşteri kaydı yok.</p>
        </div>

        <!-- Güncelleme Modalı -->
        <div v-if="selectedCustomer" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div class="w-full max-w-lg rounded-xl p-6 shadow-xl border border-white/20 backdrop-blur-md" style="background-color: rgba(255, 255, 255, 0.8); box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-sky-700">🔧 Müşteri Güncelle</h3>
              <button @click="selectedCustomer = null" class="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form class="space-y-4" @submit.prevent="updateCustomer">
              <input v-model="selectedCustomer.firmaAdi" type="text" class="w-full px-4 py-2 rounded border border-gray-300 text-black" placeholder="Firma Adı" required />
              <input v-model="selectedCustomer.yetkiliKisi" type="text" class="w-full px-4 py-2 rounded border border-gray-300 text-black" placeholder="Yetkili Kişi" required />
              <input v-model="selectedCustomer.email" type="email" class="w-full px-4 py-2 rounded border border-gray-300 text-black" placeholder="Email" />
              <input v-model="selectedCustomer.telefon" type="text" class="w-full px-4 py-2 rounded border border-gray-300 text-black" placeholder="Telefon" />
              <label class="block text-sm font-medium text-gray-700">Açıklama / Hikaye</label>
              <textarea v-model="selectedCustomer.notlar" rows="5" class="w-full px-4 py-2 rounded border border-gray-300 resize-none bg-blue-50 text-black"></textarea>
              <div class="flex justify-end">
                <button type="submit" class="bg-sky-600 text-white px-6 py-2 rounded shadow hover:bg-sky-700">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'

const searchQuery = ref('')
const selectedProjectId = ref('')
const selectedCustomer = ref(null)

const projects = ref([])
const customers = ref([])

const form = ref({
  firmaAdi: '',
  yetkiliKisi: '',
  email: '',
  telefon: '',
  notlar: ''
})

onMounted(async () => {
  try {
    const { data, error } = await useFetch('/api/projects')
    if (error.value) throw error.value
    projects.value = data.value
  } catch (e) {
    console.error('Proje verisi alınamadı:', e)
  }
})

const fetchCustomers = async () => {
  if (!selectedProjectId.value) return
  try {
    const { data, error } = await useFetch(`/api/customers/project/${selectedProjectId.value}`)
    if (error.value) throw error.value
    customers.value = data.value
  } catch (e) {
    console.error('Müşteri verisi alınamadı:', e)
  }
}

const submitCustomer = async () => {
  try {
    await $fetch('/api/customers', {
      method: 'POST',
      body: {
        ...form.value,
        projectId: selectedProjectId.value,
      }
    })

    await fetchCustomers() // form sonrası güncel listeyi çek
    form.value = { firmaAdi: '', yetkiliKisi: '', email: '', telefon: '', notlar: '' }
  } catch (err) {
    console.error('Müşteri oluşturulamadı:', err)
  }
}

const selectCustomer = (customer) => {
  selectedCustomer.value = { ...customer }
}

const updateCustomer = () => {
  const index = customers.value.findIndex(c => c.id === selectedCustomer.value.id)
  if (index !== -1) customers.value[index] = { ...selectedCustomer.value }
  selectedCustomer.value = null
}

const filteredCustomers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return customers.value.filter(c =>
      c.firmaAdi.toLowerCase().includes(q) ||
      c.yetkiliKisi?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telefon?.toLowerCase().includes(q)
  )
})
</script>
