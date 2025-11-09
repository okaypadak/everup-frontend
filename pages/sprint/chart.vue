<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-10">
          <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
            🚀 Aktif Sprint Özeti
          </h1>

          <!-- Aktif proje bilgisi -->
          <div class="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700">
            <p class="text-xs uppercase tracking-wide text-slate-500">Aktif Proje</p>
            <p v-if="projectStore.selectedProjectName" class="font-semibold text-slate-800">
              {{ projectStore.selectedProjectName }}
            </p>
            <p v-else class="text-slate-500">
              Görevler panelinden proje seçin.
            </p>
          </div>

          <!-- İçerik -->
          <div v-if="selectedProjectId">
            <div v-if="loadingSummary" class="py-6 text-center text-black">Yükleniyor…</div>

            <div v-else-if="selectedSprint" class="space-y-6">
              <div class="space-y-2">
                <h2 class="text-lg font-semibold text-black">📌 {{ selectedSprint.name }}</h2>
                <p class="text-sm text-black">
                  Tarih: {{ formatDate(selectedSprint.startDate) }} – {{ formatDate(selectedSprint.endDate) }}
                </p>
                <p class="text-sm text-black">
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

            <div v-else class="py-6 text-center text-black">
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
import { computed, ref, watch } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'

import SprintBurndownChart from '../components/sprint/SprintBurndownChart.vue'
import SprintCompletedTasksChart from '../components/sprint/SprintCompletedBarChart.vue'
import BurnupChart from '../components/sprint/BurnupChart.vue'
import ThroughputChart from '../components/sprint/ThroughputChart.vue'
import VelocityChart from '../components/sprint/VelocityChart.vue'

import { toast } from 'vue3-toastify'
import { useProjectStore } from '@/stores/projectStore'

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

const projectStore = useProjectStore()
const selectedProjectId = computed(() => projectStore.selectedProjectId)
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

watch(
  selectedProjectId,
  (val) => {
    if (!val) { summary.value = null; return }
    loadSummary(Number(val))
  },
  { immediate: true }
)

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
}, { immediate: true })

</script>
