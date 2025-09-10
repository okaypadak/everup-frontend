<template>
  <div class="bg-white rounded-xl p-4 shadow flex flex-col gap-4 h-full overflow-y-auto min-h-0">
    <!-- Başlık -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2 text-lg font-semibold text-gray-700">
        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="8" width="18" height="13" rx="2" stroke-width="2" />
          <path d="M16 3v4M8 3v4" stroke-width="2" stroke-linecap="round" />
        </svg>
        Görevler
      </div>
    </div>

    <!-- Sekmeler + Proje seçici -->
    <div class="mb-2 flex flex-wrap justify-between items-end gap-4">
      <div class="flex gap-2 flex-wrap">
        <button :class="[tabClass('devam'), 'flex items-center gap-1']" @click="taskFilter = 'devam'">
          <span class="sm:hidden">⏳</span>
          <span class="hidden sm:inline">Devam Edenler</span>
        </button>
        <button :class="[tabClass('hazir'), 'flex items-center gap-1']" @click="taskFilter = 'hazir'">
          <span class="sm:hidden">🔔</span>
          <span class="hidden sm:inline">Hazır Görevler</span>
        </button>
        <button :class="[tabClass('tamam'), 'flex items-center gap-1']" @click="taskFilter = 'tamam'">
          <span class="sm:hidden">✅</span>
          <span class="hidden sm:inline">Tamamlananlar</span>
        </button>
        <button :class="[tabClass('bekleyen'), 'flex items-center gap-1']" @click="taskFilter = 'bekleyen'">
          <span class="sm:hidden">⏱</span>
          <span class="hidden sm:inline">Bekleyenler</span>
        </button>
      </div>

      <div class="flex flex-col min-w-[220px]">
        <label class="text-sm font-medium text-gray-600 mb-1">Proje:</label>
        <div class="relative">
          <select
              v-model="selectedProjectId"
              @change="onProjectSelect"
              class="appearance-none w-full bg-white border border-gray-300 text-gray-700 text-sm py-2 px-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
          >
            <option disabled :value="null">Proje seçiniz</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 011.08 1.04l-4.24 4.25a.75.75 0 01-1.08 0l-4.25-4.25a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Etiket Filtresi -->
    <div v-if="projectLabels.length" class="flex flex-wrap gap-2 mb-2">
      <button
          v-for="label in projectLabels"
          :key="label.id"
          @click="toggleLabel(label.id)"
          :class="[
          'text-xs font-semibold px-3 py-1 rounded-full border transition-all',
          selectedLabelIds.includes(label.id)
            ? 'bg-green-500 text-white border-green-600'
            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-green-100'
        ]"
      >
        {{ label.name }}
      </button>
    </div>

    <!-- Görev Listesi -->
    <ul class="space-y-2 flex-1 overflow-y-auto min-h-0 pr-1">
      <template v-if="filteredVisibleTasks.length > 0">
        <li
            v-for="task in filteredVisibleTasks"
            :key="task.id"
            :class="[
            'rounded-md px-3 py-4 flex flex-col shadow-sm transition-all border-l-4',
            task.status === 'In Progress' && task.type === 'bug' ? 'bg-red-100 border-red-400' :
            task.status === 'In Progress' ? 'bg-yellow-100 border-yellow-400' :
            task.status === 'Waiting' ? 'border-gray-400 bg-gray-100' :
            task.status === 'Ready' ? 'border-blue-400 bg-blue-50' :
            task.status === 'Completed' ? 'border-green-500 bg-green-100 text-green-800' :
            'bg-white border-gray-200'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 flex-wrap">
              <span :class="[getTypeClass(task.type), 'text-white text-xs font-bold rounded-full px-2 py-0.5']">
                {{ getTypeLabel(task.type) }}
              </span>
              <span :class="[getLevelClass(task.level), 'text-xs font-bold rounded-full px-2 py-0.5']">
                {{ getLevelLabel(task.level) }}
              </span>
              <span v-if="task.dependentTaskId" class="bg-yellow-300 text-gray-900 text-xs font-bold rounded-full px-2 py-0.5">
                Önce: {{ task.dependentTaskTitle || 'Bağlı görev' }}
              </span>
              <span :class="task.status === 'Completed' ? 'line-through text-green-800' : 'text-gray-900'" class="font-medium">
                {{ task.title }}
              </span>
            </div>
            <span v-if="task.status === 'In Progress'" class="bg-yellow-200 text-green-800 text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
              ⏳ Devam Ediyor
            </span>
            <span v-else-if="task.status === 'Ready'" class="bg-blue-200 text-blue-800 text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
              🔔 Başlamaya Hazır
            </span>
            <span v-else-if="task.status === 'Waiting'" class="bg-gray-300 text-gray-700 text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
              ⏱ Beklemede
            </span>
            <span v-else-if="task.status === 'Completed'" class="bg-green-200 text-green-800 text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
              ✅ Tamamlandı
            </span>
          </div>

          <div class="text-xs text-gray-400 mt-1">{{ task.time }}</div>
          <div v-if="task.formattedDeadline" class="text-xs text-blue-500 mt-1">
            Bitiş Tarihi: {{ task.formattedDeadline }}
          </div>

          <!-- Alt aksiyonlar: Sil (sol) + Ayrıntı (sağ) -->
          <div class="flex items-center mt-2">
            <button
                v-if="taskFilter === 'hazir'"
                @click="askDelete(task)"
                :disabled="deletingId === task.id"
                class="text-xs px-2 py-1 rounded-md border bg-white/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition disabled:opacity-50"
                :aria-label="`Görevi sil: ${task.title}`"
                title="Sil"
            >
              {{ deletingId === task.id ? '...' : '✕ Sil' }}
            </button>

            <NuxtLink
                :to="`/tasks/${task.gorevKodu}`"
                class="ml-auto text-xs text-blue-500 underline hover:text-blue-700 hover:scale-110 transition-all flex items-center gap-1"
            >
              🔍 Ayrıntı
            </NuxtLink>
          </div>
        </li>
      </template>
      <template v-else>
        <li class="text-gray-400 text-center py-6 select-none">
          Hiç görev bulunamadı.
        </li>
      </template>
    </ul>

    <!-- Confirm Modal -->
    <div v-if="showConfirm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-80 p-6 text-center">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">Görev Silinsin mi?</h2>
        <p class="text-sm text-gray-500 mb-5">
          "{{ taskToDelete?.title }}" görevini silmek istediğine emin misin?
        </p>
        <div class="flex justify-center gap-4">
          <button
              @click="confirmDelete"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60"
              :disabled="deletingId !== null"
          >
            Evet, Sil
          </button>
          <button
              @click="closeConfirm"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Hayır
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'

const projectStore = useProjectStore()
const taskStore = useTaskStore()

type TaskStatus = 'In Progress' | 'Ready' | 'Completed' | 'Waiting'
type TaskType = 'task' | 'test' | 'approval' | 'bug' | string
type TaskLevel = 'critical' | 'urgent' | 'priority' | 'normal' | string

interface Task {
  id: number
  title: string
  status: TaskStatus
  type: TaskType
  level: TaskLevel
  createdAt: string
  deadline?: string | null
  dependentTaskId?: number | string | null
  dependentTaskTitle?: string
  gorevKodu?: string
  time?: string
  formattedDeadline?: string | null
  labels?: { id: number, name: string }[]
}

interface TaskLabel { id: number; name: string }
interface Project { id: number; name: string }

const taskFilter = ref<'devam' | 'hazir' | 'tamam' | 'bekleyen'>('devam')
const tasks = ref<Task[]>([])
const projectLabels = ref<TaskLabel[]>([])
const selectedLabelIds = ref<number[]>([])
const selectedProjectId = ref<number | null>(null)
const projects = ref<Project[]>([])

const deletingId = ref<number | null>(null)
const showConfirm = ref(false)
const taskToDelete = ref<Task | null>(null)

function tabClass(type: string) {
  return [
    'px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition-all duration-200',
    taskFilter.value === type
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
  ]
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function fetchProjects() {
  const { data, error } = await useFetch<Project[]>('/api/projects')
  if (error.value) {
    console.error('Projeler alınamadı:', error.value)
    return
  }
  projects.value = data.value || []
  if (projects.value.length === 1) {
    selectedProjectId.value = projects.value[0].id
    onProjectSelect()
  }
}

async function fetchTasksByProject(projectId: number) {
  try {
    const data = await $fetch<Task[]>(`/api/tasks/project/${projectId}`, { credentials: 'include' })
    tasks.value = data.map(task => ({
      ...task,
      gorevKodu: task.id,
      time: formatTime(task.createdAt),
      formattedDeadline: task.deadline ? formatTime(task.deadline) : null
    }))
  } catch (err) {
    console.error('Projeye göre görevler alınamadı:', err)
    tasks.value = []
  }
}

async function fetchProjectLabels(projectId: number) {
  if (projectStore.projectLabels.length > 0) {
    projectLabels.value = projectStore.projectLabels
    return
  }
  try {
    const data = await $fetch<TaskLabel[]>(`/api/task-labels/${projectId}`, { credentials: 'include' })
    projectLabels.value = data
    projectStore.setLabels(data)
  } catch (err) {
    console.error('Etiketler alınamadı:', err)
  }
}

// Proje seçimi
function onProjectSelect() {
  if (selectedProjectId.value) {
    const selected = projects.value.find(p => p.id === selectedProjectId.value)
    if (selected) projectStore.setProject(selected.id, selected.name)
    fetchTasksByProject(selectedProjectId.value)
    fetchProjectLabels(selectedProjectId.value)
  } else {
    tasks.value = []
    projectLabels.value = []
    projectStore.clearProject()
  }
  selectedLabelIds.value = []
}

// Etiket toggle + filtre
function toggleLabel(labelId: number) {
  const current = selectedLabelIds.value
  selectedLabelIds.value = current.includes(labelId)
      ? current.filter(id => id !== labelId)
      : [...current, labelId]

  if (selectedProjectId.value) {
    if (selectedLabelIds.value.length > 0) fetchFilteredTasks(selectedProjectId.value)
    else fetchTasksByProject(selectedProjectId.value)
  }
}

async function fetchFilteredTasks(projectId: number) {
  if (!selectedProjectId.value) return
  try {
    const data = await $fetch<Task[]>(`/api/tasks/project/${projectId}/filter`, {
      method: 'POST',
      body: { labelIds: selectedLabelIds.value },
      credentials: 'include'
    })
    tasks.value = data.map(task => ({
      ...task,
      gorevKodu: task.id,
      time: formatTime(task.createdAt),
      formattedDeadline: task.deadline ? formatTime(task.deadline) : null
    }))
  } catch (err) {
    console.error('Etiket filtreleme hatası:', err)
  }
}

const filteredVisibleTasks = computed(() =>
    tasks.value.filter(task =>
        (taskFilter.value === 'devam' && task.status === 'In Progress') ||
        (taskFilter.value === 'hazir' && task.status === 'Ready') ||
        (taskFilter.value === 'tamam' && task.status === 'Completed') ||
        (taskFilter.value === 'bekleyen' && task.status === 'Waiting')
    )
)

// ------ Silme Akışı (Vue confirm modal) ------
function askDelete(task: Task) {
  taskToDelete.value = task
  showConfirm.value = true
}
function closeConfirm() {
  if (deletingId.value !== null) return
  showConfirm.value = false
  taskToDelete.value = null
}
async function confirmDelete() {
  if (!taskToDelete.value) return
  try {
    deletingId.value = taskToDelete.value.id
    await $fetch(`/api/tasks/${taskToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    tasks.value = tasks.value.filter(t => t.id !== taskToDelete.value?.id)
  } catch (err) {
    console.error('Görev silinemedi:', err)
    alert('Görev silinirken hata oluştu.')
  } finally {
    deletingId.value = null
    closeConfirm()
  }
}
// ---------------------------------------------

function getTypeLabel(type: string) {
  switch (type) {
    case 'task': return 'Görev'
    case 'test': return 'Test'
    case 'approval': return 'Onay'
    case 'bug': return 'Hata'
    default: return type
  }
}
function getTypeClass(type: string) {
  switch (type) {
    case 'task': return 'bg-blue-500'
    case 'test': return 'bg-purple-500'
    case 'approval': return 'bg-teal-600'
    case 'bug': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
}
function getLevelLabel(level: string) {
  switch (level) {
    case 'critical': return 'Kritik'
    case 'urgent': return 'Acil'
    case 'priority': return 'Öncelikli'
    default: return 'Normal'
  }
}
function getLevelClass(level: string) {
  switch (level) {
    case 'critical': return 'bg-red-600 text-white'
    case 'urgent': return 'bg-orange-500 text-white'
    case 'priority': return 'bg-yellow-500 text-white'
    default: return 'bg-gray-300 text-gray-800'
  }
}

watch(() => taskStore.shouldRefresh, (val) => {
  if (val && selectedProjectId.value) {
    fetchTasksByProject(selectedProjectId.value)
    taskStore.acknowledgeRefresh()
  }
})

onMounted(async () => {
  await fetchProjects()
  if (projectStore.selectedProjectId) {
    selectedProjectId.value = projectStore.selectedProjectId
    onProjectSelect()
  }
})
</script>
