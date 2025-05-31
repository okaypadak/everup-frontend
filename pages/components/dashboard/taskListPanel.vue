<template>
  <div class="bg-white rounded-xl p-4 shadow flex flex-col gap-4" style="height: 100%; max-height: 100%;">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2 text-lg font-semibold text-gray-700">
        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="8" width="18" height="13" rx="2" stroke-width="2"/>
          <path d="M16 3v4M8 3v4" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Görevler
      </div>
      <div class="flex gap-2">
        <button
            :class="[
            'px-3 py-1 rounded-lg font-medium text-sm border transition-all',
            taskFilter === 'devam'
              ? 'bg-blue-400 text-white border-blue-400 shadow'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100 hover:shadow'
          ]"
            @click="$emit('update:taskFilter', 'devam')"
        >
          Devam Edenler
        </button>
        <button
            :class="[
            'px-3 py-1 rounded-lg font-medium text-sm border transition-all',
            taskFilter === 'tum'
              ? 'bg-blue-400 text-white border-blue-400 shadow'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100 hover:shadow'
          ]"
            @click="$emit('update:taskFilter', 'tum')"
        >
          Tümü
        </button>
      </div>
    </div>

    <ul class="space-y-2 flex-1 overflow-y-auto min-h-0 pr-1" style="max-height: 100%;">
      <template v-if="filteredTasks.length > 0">
        <li
            v-for="task in filteredTasks"
            :key="task.id"
            :class="[
            'rounded-md px-3 py-4 flex flex-col shadow-sm transition-all border-l-4',
            task.status === 'Devam' ? 'bg-yellow-50 bg-green-50' :
            task.status === 'Beklemede' ? 'border-gray-400 bg-gray-100 opacity-60 cursor-not-allowed pointer-events-none' :
            task.status === 'Tamamlandı' ? 'border-green-300 bg-white text-gray-500' :
            'bg-white border-gray-200'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span v-if="task.type === 'gorev'" class="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5">Görev</span>
              <span v-else class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">Hata</span>

              <span
                  :class="[
                  task.type === 'gorev'
                    ? (task.seviye === 'adimadim' ? 'bg-indigo-500 text-white' :
                       task.seviye === 'oncelikli' ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-800')
                    : (task.seviye === 'kritik' ? 'bg-red-600 text-white' :
                       task.seviye === 'acil' ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-800'),
                  'text-xs font-bold rounded-full px-2 py-0.5'
                ]"
              >
                {{
                  task.type === 'gorev'
                      ? (task.seviye === 'adimadim' ? 'Adım Adım' :
                          task.seviye === 'oncelikli' ? 'Öncelikli' : 'Normal')
                      : (task.seviye === 'kritik' ? 'Kritik' :
                          task.seviye === 'acil' ? 'Acil' : 'Normal')
                }}
              </span>

              <span
                  v-if="task.type === 'gorev' && task.seviye === 'adimadim' && task.bagliGorev"
                  class="bg-yellow-300 text-gray-900 text-xs font-bold rounded-full px-2 py-0.5"
              >
                Sonraki: {{ task.bagliGorevTitle || 'Bağlı görev' }}
              </span>

              <span
                  class="font-medium"
                  :class="task.status === 'Tamamlandı' ? 'line-through text-gray-500' : 'text-gray-900'"
              >
                {{ getProjectName(task.projectId) }} - {{ task.title }}
              </span>
            </div>

            <!-- 🔁 Duruma göre ikonlar -->
            <span
                v-if="task.status === 'Devam'"
                class="bg-yellow-200 text-green-800 text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
              </svg>
              Devam Ediyor
            </span>

            <span
                v-else-if="task.status === 'Beklemede'"
                class="bg-gray-300 text-gray-700 text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6v6h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
              </svg>
              Beklemede
            </span>

            <span
                v-else-if="task.status === 'Tamamlandı'"
                class="bg-green-200 text-green-800 text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                    clip-rule="evenodd"
                />
              </svg>
              Tamamlandı
            </span>
          </div>

          <div class="text-xs text-gray-400 mt-1">{{ task.time }}</div>
          <div v-if="task.deadline" class="text-xs text-blue-500 mt-1">
            Bitiş Tarihi: {{ task.deadline }}
          </div>
          <a
              :href="`/tasks/${task.gorevKodu}`"
              class="text-xs text-blue-500 underline self-end mt-1 flex items-center gap-1 transition-all hover:text-blue-700 hover:scale-110"
              target="_blank"
              rel="noopener noreferrer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Ayrıntı
          </a>
        </li>
      </template>
      <template v-else>
        <li class="text-gray-400 text-center py-6 select-none">
          {{ taskFilter === 'devam' ? 'Devam eden bir görev yok.' : 'Henüz bir görev yok.' }}
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Task {
  id: number | string
  projectId: number | string
  gorevKodu: string
  title: string
  status: string
  type: string
  seviye: string
  bagliGorev?: number | string | null
  bagliGorevTitle?: string
  deadline?: string
  time: string
}
interface Project {
  id: number | string
  name: string
}

const { filteredTasks, taskFilter, projects } = defineProps<{
  filteredTasks: Task[]
  taskFilter: string
  projects: Project[]
}>()

const emit = defineEmits<{
  (e: 'update:taskFilter', value: string): void
}>()

function getProjectName(projectId: number | string): string {
  const found = projects.find(p => p.id === projectId)
  return found ? found.name : ''
}
</script>
