<template>
  <div class="bg-white rounded-xl p-4 shadow flex flex-col gap-4" style="height: 100%; max-height: 100%;">
    <!-- Başlık ve Filtreler -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2 text-lg font-semibold text-gray-700">
        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="8" width="18" height="13" rx="2" stroke-width="2"/>
          <path d="M16 3v4M8 3v4" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Görevler
      </div>
      <div class="flex gap-2">
        <button :class="buttonClass('devam')" @click="taskFilter = 'devam'">Devam Edenler</button>
        <button :class="buttonClass('hazir')" @click="taskFilter = 'hazir'">Hazır Görevler</button>
        <button :class="buttonClass('tum')" @click="taskFilter = 'tum'">Tümü</button>
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
          {{
            taskFilter === 'devam' ? 'Devam eden bir görev yok.' :
                taskFilter === 'hazir' ? 'Başlamaya hazır görev yok.' :
                    'Henüz bir görev yok.'
          }}
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineExpose } from 'vue'

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
}

interface TaskLabel {
  id: number
  name: string
}

const taskFilter = ref<'devam' | 'hazir' | 'tum'>('devam')
const tasks = ref<Task[]>([])
const projectLabels = ref<TaskLabel[]>([])
const selectedLabelIds = ref<number[]>([])
const isLoading = ref(false)

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function fetchTasks() {
  isLoading.value = true
  try {
    const data = await $fetch<Task[]>('/api/tasks/user', { credentials: 'include' })
    tasks.value = data.map(task => ({
      ...task,
      gorevKodu: task.id,
      time: formatTime(task.createdAt),
      formattedDeadline: task.deadline ? formatTime(task.deadline) : null
    }))
  } catch (err) {
    console.error('Görev çekilemedi:', err)
    tasks.value = []
  } finally {
    isLoading.value = false
  }
}

async function fetchProjectLabels(projectId: number | string) {
  try {
    const data = await $fetch<TaskLabel[]>(`/api/task-labels/${projectId}`, {
      credentials: 'include'
    })
    projectLabels.value = data
    console.log('Gelen etiketler:', data)
  } catch (err) {
    console.error('Etiketler alınamadı:', err)
  }
}

function toggleLabel(labelId: number) {
  if (selectedLabelIds.value.includes(labelId)) {
    selectedLabelIds.value = selectedLabelIds.value.filter(id => id !== labelId)
  } else {
    selectedLabelIds.value.push(labelId)
  }
}

onMounted(() => {
  fetchTasks()
  fetchProjectLabels(1)
})

defineExpose({ fetchTasks })

const filteredVisibleTasks = computed(() =>
    tasks.value.filter(task => {
      const matchesStatus =
          taskFilter.value === 'tum' ||
          (taskFilter.value === 'devam' && task.status === 'In Progress') ||
          (taskFilter.value === 'hazir' && task.status === 'Ready')

      const matchesLabels =
          selectedLabelIds.value.length === 0 ||
          (task.labels || []).some(label => selectedLabelIds.value.includes(label.id))

      return matchesStatus && matchesLabels
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
</script>
