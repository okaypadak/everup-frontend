<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg">
          <h2 class="text-2xl font-bold text-sky-700 mb-6">🌀 Yeni Sprint Oluştur</h2>

          <form class="space-y-6" @submit.prevent="submitSprint">
            <!-- Proje Seçimi -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Proje Seç</label>
              <select
                  v-model="form.projectId"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  :disabled="loading || submitting"
                  required
              >
                <option value="" disabled>Bir proje seçin</option>

                <!-- Yükleniyor -->
                <option v-if="loading" disabled>Yükleniyor…</option>

                <!-- Hata -->
                <option v-else-if="error" disabled>{{ error }}</option>

                <!-- Boş liste -->
                <option v-else-if="!projects.length" disabled>Proje bulunamadı</option>

                <!-- Liste -->
                <option
                    v-else
                    v-for="project in projects"
                    :key="project.id"
                    :value="project.id"
                >
                  {{ project.name }}
                </option>
              </select>
            </div>

            <!-- Sprint Adı -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sprint Adı</label>
              <input
                  v-model="form.name"
                  type="text"
                  placeholder="Örn: Sprint 14 - Haziran"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  :disabled="submitting"
                  required
              >
            </div>

            <!-- Tarihler -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                <input
                    v-model="form.startDate"
                    type="date"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    :disabled="submitting"
                    required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input
                    v-model="form.endDate"
                    type="date"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    :disabled="submitting"
                    required
                >
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
                  :disabled="submitting"
              />
            </div>

            <!-- Buton -->
            <div class="flex justify-end">
              <button
                  type="submit"
                  :disabled="submitting || loading"
                  class="bg-sky-600 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-xl shadow transition"
              >
                {{ submitting ? 'Oluşturuluyor…' : 'Sprint Oluştur' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'
import { toast } from 'vue3-toastify'

type Project = { id: number | string; name: string }

const emit = defineEmits<{ (e: 'created', sprint: any): void }>()

const form = reactive({
  projectId: '' as string | number | '',
  name: '',
  startDate: '',
  endDate: '',
  goal: ''
})

const projects = ref<Project[]>([])
const loading = ref(false)      // projeler yükleniyor
const error = ref('')
const submitting = ref(false)   // sprint oluşturma yükleniyor

// Projeleri getir
const loadProjects = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<any>('/api/projects')
    const items: Project[] = Array.isArray(res) ? res : (res?.items ?? [])
    projects.value = items.map(p => ({ id: p.id, name: p.name }))
    if (form.projectId && !projects.value.some(p => String(p.id) === String(form.projectId))) {
      form.projectId = ''
    }
  } catch (e: any) {
    console.error('Projeler alınamadı:', e)
    error.value = 'Projeler alınamadı'
    toast.error('Projeler alınamadı')
  } finally {
    loading.value = false
  }
}

onMounted(loadProjects)

// Tarih doğrulama
watch([() => form.startDate, () => form.endDate], () => {
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    toast.error('Bitiş tarihi başlangıç tarihinden önce olamaz')
    form.endDate = ''
  }
})

const resetForm = () => {
  form.projectId = ''
  form.name = ''
  form.startDate = ''
  form.endDate = ''
  form.goal = ''
}

const submitSprint = async () => {
  if (!form.projectId) {
    toast.error('Lütfen bir proje seçin.')
    return
  }
  if (!form.name || !form.startDate || !form.endDate) {
    toast.error('Zorunlu alanları doldurun.')
    return
  }

  submitting.value = true
  try {
    const payload = {
      projectId: Number(form.projectId),
      name: form.name.trim(),
      startDate: form.startDate, // YYYY-MM-DD
      endDate: form.endDate,     // YYYY-MM-DD
      goal: form.goal?.trim() || undefined
    }

    const created = await $fetch('/api/sprints', {
      method: 'POST',
      body: payload
    })

    toast.success('Sprint oluşturuldu')
    emit('created', created)
    resetForm()
  } catch (e: any) {
    console.error('Sprint oluşturulamadı:', e)
    const msg = e?.data?.message || e?.message || 'Sprint oluşturulamadı'
    toast.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>
