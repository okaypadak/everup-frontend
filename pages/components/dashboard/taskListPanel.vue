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
            taskFilter === 'hazir'
              ? 'bg-blue-400 text-white border-blue-400 shadow'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100 hover:shadow'
          ]"
            @click="$emit('update:taskFilter', 'hazir')"
        >
          Hazır Görevler
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

    <!-- Görev Listesi -->
    <ul class="space-y-2 flex-1 overflow-y-auto min-h-0 pr-1" style="max-height: 100%;">
      <template v-if="filteredVisibleTasks.length > 0">
        <li
            v-for="task in filteredVisibleTasks"
            :key="task.id"
            :class="[
            'rounded-md px-3 py-4 flex flex-col shadow-sm transition-all border-l-4',
            task.status === 'Devam' && task.type === 'hata' ? 'bg-red-100 border-red-400' :
            task.status === 'Devam' ? 'bg-yellow-100 border-yellow-400' :
            task.status === 'Beklemede' ? 'border-gray-400 bg-gray-100' :
            task.status === 'Hazır' ? 'border-blue-400 bg-blue-50' :
            task.status === 'Tamamlandı' ? 'border-green-300 bg-white text-gray-500' :
            'bg-white border-gray-200'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Görev Türü -->
              <span
                  :class="[
                  task.type === 'gorev' ? 'bg-blue-500' :
                  task.type === 'test' ? 'bg-purple-500' :
                  task.type === 'onay' ? 'bg-teal-600' :
                  task.type === 'hata' ? 'bg-red-500' :
                  'bg-gray-400',
                  'text-white text-xs font-bold rounded-full px-2 py-0.5'
                ]"
              >
                {{
                  task.type === 'gorev' ? 'Görev' :
                      task.type === 'test' ? 'Test' :
                          task.type === 'onay' ? 'Onay' :
                              task.type === 'hata' ? 'Hata' :
                                  'Bilinmiyor'
                }}
              </span>
              <!-- Seviye -->
              <span
                  :class="[
                  task.seviye === 'kritik' ? 'bg-red-600 text-white' :
                  task.seviye === 'acil' ? 'bg-orange-500 text-white' :
                  task.seviye === 'öncelikli' ? 'bg-yellow-500 text-white' :
                  'bg-gray-300 text-gray-800',
                  'text-xs font-bold rounded-full px-2 py-0.5'
                ]"
              >
                {{
                  task.seviye === 'kritik' ? 'Kritik' :
                      task.seviye === 'acil' ? 'Acil' :
                          task.seviye === 'öncelikli' ? 'Öncelikli' :
                              'Normal'
                }}
              </span>
              <!-- Önceki görev -->
              <span
                  v-if="task.bagliGorev"
                  class="bg-yellow-300 text-gray-900 text-xs font-bold rounded-full px-2 py-0.5"
              >
                Önce: {{ task.bagliGorevTitle || 'Bağlı görev' }}
              </span>
              <!-- Başlık -->
              <span
                  class="font-medium"
                  :class="task.status === 'Tamamlandı' ? 'line-through text-gray-500' : 'text-gray-900'"
              >
                {{ task.title }}
              </span>
            </div>
            <!-- Durum Rozetleri -->
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
                v-else-if="task.status === 'Hazır'"
                class="bg-blue-200 text-blue-800 text-xs rounded-full px-2 py-0.5 font-bold flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6v6h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
              </svg>
              Başlamaya Hazır
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
          <NuxtLink
              :to="`/tasks/${task.gorevKodu}`"
              class="text-xs text-blue-500 underline self-end mt-1 flex items-center gap-1 transition-all hover:text-blue-700 hover:scale-110"
              target="_blank"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Ayrıntı
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
import { computed } from 'vue'

// Sadece Task arayüzü
interface RawTask {
  id: number | string
  title: string
  description: string
  status: string
  type: string
  level: string
  createdAt: string
  deadline?: string | null
  dependentTaskId?: number | string | null
}

// Mapping fonksiyonları
function mapStatus(status: string) {
  switch (status) {
    case 'Ready': return 'Hazır'
    case 'Waiting': return 'Beklemede'
    case 'InProgress': return 'Devam'
    case 'Completed': return 'Tamamlandı'
    default: return status
  }
}
function mapType(type: string) {
  switch (type) {
    case 'task': return 'gorev'
    case 'test': return 'test'
    case 'approval': return 'onay'
    case 'bug': return 'hata'
    default: return type
  }
}
function mapLevel(level: string) {
  switch (level) {
    case 'critical': return 'kritik'
    case 'urgent': return 'acil'
    case 'priority': return 'öncelikli'
    case 'normal': return 'normal'
    default: return level
  }
}

function formatTime(createdAt: string) {
  const d = new Date(createdAt)
  return d.toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const { filteredTasks, taskFilter } = defineProps<{
  filteredTasks: RawTask[]
  taskFilter: string
}>()

const emit = defineEmits<{
  (e: 'update:taskFilter', value: string): void
}>()

const tasksForView = computed(() => filteredTasks.map(task => ({
  ...task,
  gorevKodu: task.id,             // Ayrıntı linki için
  status: mapStatus(task.status),
  type: mapType(task.type),
  seviye: mapLevel(task.level),
  bagliGorev: task.dependentTaskId,
  bagliGorevTitle: '',            // Bağlı görev adı eklemek istersen doldur
  time: formatTime(task.createdAt),
})))

const filteredVisibleTasks = computed(() =>
    tasksForView.value.filter(task => {
      if (taskFilter === 'tum') return true
      if (taskFilter === 'devam') return task.status === 'Devam'
      if (taskFilter === 'hazir') return task.status === 'Hazır'
      return false
    })
)
</script>
