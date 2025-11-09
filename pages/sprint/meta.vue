<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">
          <!-- Başlık -->
          <h1 class="text-2xl font-bold text-sky-700">🚀 Aktif Sprint Özeti</h1>

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

          <!-- Sprint İçeriği -->
          <div v-if="selectedProjectId">
            <div v-if="loadingSummary" class="text-black py-10 text-center">Yükleniyor…</div>

            <div v-else-if="activeSprint" class="space-y-6">
              <SprintMetaInfo :sprint="activeSprint" />
              <SprintProgressBar :completed="completedTaskCount" :total="projectSprintTasks.length" />
              <SprintTaskTable :tasks="projectSprintTasks" />
            </div>

            <div v-else class="text-center py-10 text-black">
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
import SprintMetaInfo from '../components/sprint/SprintMetaInfo.vue'
import SprintProgressBar from '../components/sprint/SprintProgressBar.vue'
import SprintTaskTable from '../components/sprint/SprintTaskTable.vue'
import { toast } from 'vue3-toastify'
import { useProjectStore } from '@/stores/projectStore'

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

const projectStore = useProjectStore()
const selectedProjectId = computed(() => projectStore.selectedProjectId)

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

watch(
  selectedProjectId,
  (val) => {
    if (!val) { summary.value = null; return }
    loadSummary(Number(val))
  },
  { immediate: true }
)
</script>
