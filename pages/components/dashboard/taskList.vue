<template>
  <div class="bg-white rounded-xl p-4 shadow flex flex-col gap-4 h-full overflow-y-auto min-h-0">

    <!-- Başlık ve Filtreler -->
    <div class="flex items-center justify-between mb-2">

      <div class="flex items-center gap-2 text-lg font-semibold text-gray-700">
        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="8" width="18" height="13" rx="2" stroke-width="2"/>
          <path d="M16 3v4M8 3v4" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Görevler
      </div>

      <div class="mb-2 flex gap-4 flex-wrap">

        <!-- Filtre Tabs -->
        <div class="w-full border-gray-200 flex gap-2 mb-4">

          <div class="flex flex-col pr-9">

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
              <!-- aşağı ok simgesi -->
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 011.08 1.04l-4.24 4.25a.75.75 0 01-1.08 0l-4.25-4.25a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <button
              :class="tabClass('devam')"
              @click="taskFilter = 'devam'"
          >
            Devam Edenler
          </button>
          <button
              :class="tabClass('hazir')"
              @click="taskFilter = 'hazir'"
          >
            Hazır Görevler
          </button>
          <button
              :class="tabClass('kendim')"
              @click="taskFilter = 'kendim'"
          >
            Kendi Açtığım
          </button>
          <button
              :class="tabClass('tum')"
              @click="taskFilter = 'tum'"
          >
            Tümü
          </button>
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
    <ul class="space-y-2 flex-1 overflow-y-auto min-h-0 pr-1" style="max-height: 100%;">
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
            task.status === 'Completed' ? 'border-green-300 bg-white text-gray-500' :
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
              <span :class="task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'" class="font-medium">
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
          <NuxtLink :to="`/tasks/${task.gorevKodu}`" class="text-xs text-blue-500 underline self-end mt-1 hover:text-blue-700 hover:scale-110 transition-all flex items-center gap-1">
            🔍 Ayrıntı
          </NuxtLink>
        </li>
      </template>
      <template v-else>
        <li class="text-gray-400 text-center py-6 select-none">
          Hiç görev bulunamadı.
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Task {
  id: number | string
  title: string
  status: string
  type: string
  level: string
  createdAt: string
  deadline?: string | null
  dependentTaskId?: number | string | null
  dependentTaskTitle?: string
  gorevKodu?: string
  time?: string
  formattedDeadline?: string | null
  labels?: { id: number, name: string }[]
  assignedTo?: number
  createdBy?: number
  project?: { id: number; name: string }
}

interface TaskLabel {
  id: number
  name: string
}

interface User {
  id: number
  fullName: string
}

interface Project {
  id: number
  name: string
}

function tabClass(type: string) {
  return [
    'px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition-all duration-200',
    taskFilter.value === type
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
  ]
}

const taskFilter = ref<'devam' | 'hazir' | 'tum' | 'kendim'>('devam')
const tasks = ref<Task[]>([])
const projectLabels = ref<TaskLabel[]>([])
const selectedLabelIds = ref<number[]>([])
const selectedProjectId = ref<number | null>(null)
const projects = ref<Project[]>([])

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function fetchProjects() {
  const { data, error } = await useFetch<Project[]>('/api/projects')
  if (error.value) return console.error('Projeler alınamadı:', error.value)
  projects.value = data.value || []
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
  try {
    const data = await $fetch<TaskLabel[]>(`/api/task-labels/${projectId}`, { credentials: 'include' })
    projectLabels.value = data
  } catch (err) {
    console.error('Etiketler alınamadı:', err)
  }
}


function onProjectSelect() {
  if (selectedProjectId.value) {
    fetchTasksByProject(selectedProjectId.value)
    fetchProjectLabels(selectedProjectId.value)
  } else {
    tasks.value = []
    projectLabels.value = []
  }
  selectedLabelIds.value = []
}

function toggleLabel(labelId: number) {
  const current = selectedLabelIds.value

  if (current.includes(labelId)) {
    selectedLabelIds.value = current.filter(id => id !== labelId)
  } else {
    selectedLabelIds.value = [...current, labelId]
  }

  if (selectedProjectId.value) {
    if (selectedLabelIds.value.length > 0) {
      fetchFilteredTasks(selectedProjectId.value)
    } else {
      fetchTasksByProject(selectedProjectId.value)
    }
  }
}

async function fetchFilteredTasks(projectId: number) {
  if (!selectedProjectId.value) return

  try {
    const data = await $fetch<Task[]>(`/api/tasks/project/${projectId}/filter`, {
      method: 'POST',
      body: {
        labelIds: selectedLabelIds.value
      },
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
    tasks.value.filter(task => {

      // 'kendim' filtresi aktif olduğunda, zaten sadece oluşturulan görevleri getiriyoruz
      if (taskFilter.value === 'kendim') {
        return true
      }

      const matchesStatus =
          taskFilter.value === 'tum' ||
          (taskFilter.value === 'devam' && task.status === 'In Progress') ||
          (taskFilter.value === 'hazir' && task.status === 'Ready') ||
          (taskFilter.value === 'tamam' && task.status === 'Completed')
      return matchesStatus
    })
)

function buttonClass(type: string) {
  return [
    'px-3 py-1 rounded-lg font-medium text-sm border transition-all',
    taskFilter.value === type
        ? 'bg-blue-400 text-white border-blue-400 shadow'
        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100 hover:shadow'
  ]
}

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

// Görev filtresi değişikliklerini izle ve filtrelemeyi tetikle
watch(taskFilter, () => {
  if (taskFilter.value === 'kendim') {
    fetchCreatedTasks()
  } else if (selectedProjectId.value && selectedLabelIds.value.length > 0) {
    fetchFilteredTasks(selectedProjectId.value)
  } else if (selectedProjectId.value) {
    fetchTasksByProject(selectedProjectId.value)
  }
})

// Kullanıcının oluşturduğu görevleri getir
async function fetchCreatedTasks() {
  try {
    tasks.value = []
    const data = await $fetch<Task[]>('/api/tasks/created', { credentials: 'include' })
    tasks.value = data.map(task => ({
      ...task,
      gorevKodu: task.id,
      time: formatTime(task.createdAt),
      formattedDeadline: task.deadline ? formatTime(task.deadline) : null
    }))
  } catch (err) {
    console.error('Kullanıcının oluşturduğu görevler alınamadı:', err)
    tasks.value = []
  }
}

onMounted(() => {
  fetchProjects()
})
</script>
