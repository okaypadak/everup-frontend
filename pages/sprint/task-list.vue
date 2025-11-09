<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-8">
          <h1 class="text-2xl font-bold text-sky-700">🧩 Görevleri Sprint'e Ata</h1>

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

          <!-- Aktif Sprint ve Görevler -->
          <div v-if="activeSprint">
            <div class="mb-4">
              <h2 class="text-xl font-semibold text-black">
                📋 {{ activeSprint.name }} ({{ activeSprint.startDate }} - {{ activeSprint.endDate }})
              </h2>
            </div>

            <!-- Atanmış Görevler -->
            <div>
              <h3 class="text-lg font-medium text-black mb-2">Atanmış Görevler</h3>
              <ul class="space-y-2">
                <li
                    v-for="task in assignedTasks"
                    :key="task.id"
                    class="bg-green-50 border border-green-200 px-4 py-2 rounded flex justify-between items-center"
                >
                  <span>✅ {{ task.title }}</span>
                  <button
                      class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      :disabled="pending.has(task.id)"
                      @click="removeFromSprint(task)"
                  >
                    {{ pending.has(task.id) ? 'Çıkarılıyor…' : 'Sprint\'ten Çıkar' }}
                  </button>
                </li>
                <li v-if="!assignedTasks.length && !loadingTasks" class="text-black">
                  Henüz görev atanmadı.
                </li>
                <li v-if="loadingTasks" class="text-black">Yükleniyor…</li>
              </ul>
            </div>

            <!-- Hazır Görevler -->
            <div class="mt-6">
              <h3 class="text-lg font-medium text-black mb-2">Hazır Görevler</h3>
              <ul class="space-y-2">
                <li
                    v-for="task in availableTasks"
                    :key="task.id"
                    class="bg-white border px-4 py-2 rounded flex justify-between items-center"
                >
                  <span>📝 {{ task.title }}</span>
                  <button
                      class="bg-sky-600 hover:bg-sky-700 text-white px-4 py-1 rounded text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      :disabled="pending.has(task.id)"
                      @click="assignToSprint(task)"
                  >
                    {{ pending.has(task.id) ? 'Atanıyor…' : 'Ata' }}
                  </button>
                </li>
                <li v-if="!availableTasks.length && !loadingTasks" class="text-black">
                  Atanabilir görev kalmadı.
                </li>
                <li v-if="loadingTasks" class="text-black">Yükleniyor…</li>
              </ul>
            </div>
          </div>

          <div v-else class="py-10 text-center text-black">
            <template v-if="selectedProjectId">
              Aktif sprint yok
            </template>
            <template v-else>
              Görevler panelinden proje seçin
            </template>
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
import { toast } from 'vue3-toastify'
import { useProjectStore } from '@/stores/projectStore'

type Sprint = { id: number; name: string; startDate: string; endDate: string; projectId?: number }
type TaskLite = { id: number; title: string; sprintId: number | null; projectId: number | null }

const projectStore = useProjectStore()
const selectedProjectId = computed(() => projectStore.selectedProjectId)

const activeSprint = ref<Sprint | null>(null)
const assignedTasks = ref<TaskLite[]>([])
const availableTasks = ref<TaskLite[]>([])

const loadingActive = ref(false)
const loadingTasks = ref(false)
const pending = ref<Set<number>>(new Set()) // taskId'ler için in-flight durum

/* -------- data loaders -------- */

const loadActiveSprint = async (projectId: number) => {
  loadingActive.value = true
  activeSprint.value = null
  assignedTasks.value = []
  availableTasks.value = []
  try {
    const sprint = await $fetch<Sprint | null>('/api/sprints/active', { query: { projectId } })
    activeSprint.value = sprint
    if (sprint) await loadTasksAndAvailable(sprint.id, projectId)
  } catch (e: any) {
    console.error('[active sprint] hata:', e)
    toast.error('Aktif sprint alınamadı')
  } finally {
    loadingActive.value = false
  }
}

const loadTasksAndAvailable = async (sprintId: number, projectId: number) => {
  loadingTasks.value = true
  try {
    const [assigned, available] = await Promise.all([
      $fetch<TaskLite[]>(`/api/sprints/${sprintId}/tasks`),
      $fetch<TaskLite[]>('/api/sprints/available-tasks', { query: { projectId } })
    ])
    assignedTasks.value = assigned
    availableTasks.value = available
  } catch (e: any) {
    console.error('[tasks] hata:', e)
    toast.error('Görevler alınamadı')
  } finally {
    loadingTasks.value = false
  }
}

/* -------- actions -------- */

const assignToSprint = async (task: TaskLite) => {
  if (!activeSprint.value) return toast.error('Aktif sprint yok')
  const sprintId = activeSprint.value.id
  if (pending.value.has(task.id)) return
  pending.value.add(task.id)

  // optimistic update
  availableTasks.value = availableTasks.value.filter(t => t.id !== task.id)
  assignedTasks.value = [{ ...task, sprintId }, ...assignedTasks.value]

  try {
    await $fetch(`/api/sprints/${sprintId}/tasks/${task.id}`, { method: 'POST' })
    toast.success('Görev sprint’e atandı')
  } catch (e: any) {
    // rollback
    assignedTasks.value = assignedTasks.value.filter(t => t.id !== task.id)
    availableTasks.value = [{ ...task, sprintId: null }, ...availableTasks.value]
    const msg = e?.data?.message || e?.message || 'Atama başarısız'
    toast.error(msg)
  } finally {
    pending.value.delete(task.id)
  }
}

const removeFromSprint = async (task: TaskLite) => {
  if (!activeSprint.value) return
  const sprintId = activeSprint.value.id
  if (pending.value.has(task.id)) return
  pending.value.add(task.id)

  // optimistic update
  assignedTasks.value = assignedTasks.value.filter(t => t.id !== task.id)
  availableTasks.value = [{ ...task, sprintId: null }, ...availableTasks.value]

  try {
    await $fetch(`/api/sprints/${sprintId}/tasks/${task.id}`, { method: 'DELETE' })
    toast.success('Görev sprint’ten çıkarıldı')
  } catch (e: any) {
    // rollback
    availableTasks.value = availableTasks.value.filter(t => t.id !== task.id)
    assignedTasks.value = [{ ...task }, ...assignedTasks.value]
    const msg = e?.data?.message || e?.message || 'Çıkarma başarısız'
    toast.error(msg)
  } finally {
    pending.value.delete(task.id)
  }
}

watch(
  selectedProjectId,
  async (val) => {
    if (!val) {
      activeSprint.value = null
      assignedTasks.value = []
      availableTasks.value = []
      return
    }
    await loadActiveSprint(Number(val))
  },
  { immediate: true }
)
</script>
