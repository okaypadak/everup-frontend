<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">
          <!-- Başlık -->
          <h1 class="text-2xl font-bold text-sky-700">🚀 Aktif Sprint Özeti</h1>

          <!-- Proje Seçimi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Proje Seç</label>
            <select
                v-model="selectedProjectId"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                :disabled="loadingProjects || loadingSummary"
            >
              <option disabled value="">Bir proje seçin</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>

          <!-- Sprint İçeriği -->
          <div v-if="selectedProjectId">
            <div v-if="loadingSummary" class="text-gray-400 py-10 text-center">Yükleniyor…</div>

            <div v-else-if="activeSprint" class="space-y-6">
              <SprintMetaInfo :sprint="activeSprint" />
              <SprintProgressBar :completed="completedTaskCount" :total="projectSprintTasks.length" />
              <SprintTaskTable :tasks="projectSprintTasks" />
            </div>

            <div v-else class="text-center py-10 text-gray-500">
              📭 Bu projeye ait aktif bir sprint bulunmamaktadır.
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'
import SprintMetaInfo from '../components/sprint/SprintMetaInfo.vue'
import SprintProgressBar from '../components/sprint/SprintProgressBar.vue'
import SprintTaskTable from '../components/sprint/SprintTaskTable.vue'
import { toast } from 'vue3-toastify'

type Project = { id: number; name: string }
type Sprint = {
  id: number; name: string; startDate: string; endDate: string; goal?: string;
  projectId?: number; projectName?: string; createdAt?: string;
}
type TaskLite = {
  id: number; title: string;
  status?: string; statusLabel?: string;
  sprintId: number | null; projectId: number | null;
  completedAt?: string | null;
}
type Summary = {
  sprint: Sprint | null;
  tasks: TaskLite[];
  stats: { total: number; completed: number; inProgress: number; waiting: number; percent: number };
  remainingDays: number;
  today: string;
  charts: any;
}

const projects = ref<Project[]>([])
const selectedProjectId = ref<number | ''>('')

const loadingProjects = ref(false)
const loadingSummary = ref(false)

const summary = ref<Summary | null>(null)

const activeSprint = computed<Sprint | null>(() => summary.value?.sprint ?? null)
const projectSprintTasks = computed<TaskLite[]>(() => summary.value?.tasks ?? [])
const completedTaskCount = computed<number>(() =>
    summary.value?.stats?.completed ??
    projectSprintTasks.value.filter(t =>
        (t.statusLabel && t.statusLabel.toLowerCase() === 'tamamlandı') ||
        (t.status && t.status.toLowerCase() === 'completed')
    ).length
)

/* --- load functions --- */
const loadProjects = async () => {
  loadingProjects.value = true
  try {
    const res = await $fetch<any>('/api/projects')
    const items: Project[] = Array.isArray(res) ? res : (res?.items ?? [])
    projects.value = items.map(p => ({ id: Number(p.id), name: p.name }))
  } catch (e: any) {
    console.error('[projects] hata:', e)
    toast.error('Projeler alınamadı')
  } finally {
    loadingProjects.value = false
  }
}

const loadSummary = async (projectId: number) => {
  loadingSummary.value = true
  summary.value = null
  try {
    const res = await $fetch<Summary>('/api/sprints/active-summary', { query: { projectId } })
    summary.value = res
  } catch (e: any) {
    console.error('[active-summary] hata:', e)
    const msg = e?.data?.message || e?.message || 'Aktif sprint özeti alınamadı'
    toast.error(msg)
  } finally {
    loadingSummary.value = false
  }
}

/* --- effects --- */
onMounted(loadProjects)

watch(selectedProjectId, (val) => {
  if (!val) { summary.value = null; return }
  loadSummary(Number(val))
})
</script>
