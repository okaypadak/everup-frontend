<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-10">
          <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
            🚀 Aktif Sprint Özeti
          </h1>

          <!-- Proje Seç -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Proje Seç</label>
            <select
                v-model="selectedProjectId"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                :disabled="loadingProjects || loadingSummary"
            >
              <option disabled value="">Bir proje seçin</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- İçerik -->
          <div v-if="selectedProjectId">
            <div v-if="loadingSummary" class="py-6 text-center text-gray-400">Yükleniyor…</div>

            <div v-else-if="selectedSprint" class="space-y-6">
              <div class="space-y-2">
                <h2 class="text-lg font-semibold text-gray-700">📌 {{ selectedSprint.name }}</h2>
                <p class="text-sm text-gray-600">
                  Tarih: {{ formatDate(selectedSprint.startDate) }} – {{ formatDate(selectedSprint.endDate) }}
                </p>
                <p class="text-sm text-gray-600">
                  Kalan Gün: {{ remainingDays }} gün
                </p>
              </div>

              <!-- Grafikler -->
              <div class="space-y-6 mt-6">

                <!-- Burndown (summary.charts içinden ideal/actualRemaining) -->
                <SprintBurndownChart :charts="summary?.charts" />

                <!-- Tamamlandı/Devam/Bekliyor dağılımı -->
                <SprintCompletedTasksChart :tasks="selectedSprintTasks" />

                <!-- Burnup / Throughput / Velocity -->
                <BurnupChart :charts="burnup" />
                <ThroughputChart :charts="throughput" />
                <VelocityChart :items="velocity" />
              </div>
            </div>

            <div v-else class="py-6 text-center text-gray-500">
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

import SprintBurndownChart from '../components/sprint/SprintBurndownChart.vue'
import SprintCompletedTasksChart from '../components/sprint/SprintCompletedBarChart.vue'
import SprintMetaInfo from '../components/sprint/SprintMetaInfo.vue'
import BurnupChart from '../components/sprint/BurnupChart.vue'
import ThroughputChart from '../components/sprint/ThroughputChart.vue'
import VelocityChart from '../components/sprint/VelocityChart.vue'

import { toast } from 'vue3-toastify'

type Project = { id: number; name: string }
type Sprint = { id: number; name: string; startDate: string; endDate: string; goal?: string }
type TaskLite = {
  id: number
  title: string
  status?: string
  statusLabel?: string
  sprintId: number | null
  projectId: number | null
  completedAt?: string | null
}
type Summary = {
  sprint: Sprint | null
  tasks: TaskLite[]                  // <- eklendi
  stats: { total: number; completed: number; inProgress: number; waiting: number; percent: number }
  remainingDays: number
  today: string
  charts: any
}

const projects = ref<Project[]>([])
const selectedProjectId = ref<number | ''>('')
const loadingProjects = ref(false)
const loadingSummary = ref(false)

const summary = ref<Summary | null>(null)
const burnup = ref({ dates: [] as string[], cumulativeCompleted: [] as number[], scopePerDay: [] as number[] })
const throughput = ref({ dates: [] as string[], completedPerDay: [] as number[] })
const velocity = ref<any[]>([])

const selectedSprint = computed(() => summary.value?.sprint ?? null)
const selectedSprintTasks = computed<TaskLite[]>(() => summary.value?.tasks ?? [])

const formatDate = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
  return new Date(dateStr).toLocaleDateString('tr-TR', options)
}

const remainingDays = computed(() => (selectedSprint.value ? summary.value?.remainingDays ?? 0 : 0))

/* loaders */
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
    summary.value = await $fetch<Summary>('/api/sprints/active-summary', { query: { projectId } })
  } catch (e: any) {
    console.error('[active-summary] hata:', e)
    const msg = e?.data?.message || e?.message || 'Aktif sprint özeti alınamadı'
    toast.error(msg)
  } finally {
    loadingSummary.value = false
  }
}

onMounted(loadProjects)

watch(selectedProjectId, (val) => {
  if (!val) { summary.value = null; return }
  loadSummary(Number(val))
})

// ayrı watch ile diğer chart verileri
const loadingCharts = ref(false)
let chartsReqId = 0

watch(selectedProjectId, async (pid) => {
  if (!pid) {
    burnup.value = { dates: [], cumulativeCompleted: [], scopePerDay: [] }
    throughput.value = { dates: [], completedPerDay: [] }
    velocity.value = []
    return
  }

  const projectId = Number(pid)
  if (!Number.isFinite(projectId)) return

  const myReq = ++chartsReqId
  loadingCharts.value = true

  try {
    const [b, t, v] = await Promise.all([
      $fetch('/api/sprints/burnup',     { query: { projectId } }),
      $fetch('/api/sprints/throughput', { query: { projectId } }),
      $fetch('/api/sprints/velocity',   { query: { projectId, limit: 6, type: 'count' } }),
    ])

    // başka bir seçim yapılmışsa bu cevabı görmezden gel
    if (myReq !== chartsReqId) return

    burnup.value = b ?? { dates: [], cumulativeCompleted: [], scopePerDay: [] }
    throughput.value = t ?? { dates: [], completedPerDay: [] }
    velocity.value = Array.isArray(v) ? v : []
  } catch (e) {
    if (myReq !== chartsReqId) return
    console.error('[charts] hata:', e)
    burnup.value = { dates: [], cumulativeCompleted: [], scopePerDay: [] }
    throughput.value = { dates: [], completedPerDay: [] }
    velocity.value = []
  } finally {
    if (myReq === chartsReqId) loadingCharts.value = false
  }
})

</script>
