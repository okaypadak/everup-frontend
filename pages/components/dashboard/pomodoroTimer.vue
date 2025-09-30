<template>
  <div class="bg-white rounded-xl shadow p-6 flex flex-col h-full">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <h2 class="text-xl font-semibold text-gray-800">Pomodoro Zamanlayıcısı</h2>
        <p class="text-sm text-gray-500">
          Odak sürenizi yönetmek için Pomodoro yöntemi kullanın.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
          :class="currentPhase === 'focus' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'"
        >
          <span class="h-2 w-2 rounded-full" :class="currentPhase === 'focus' ? 'bg-red-500' : 'bg-emerald-500'"></span>
          {{ phaseLabel }}
        </span>
        <button
          type="button"
          class="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
          @click="handleHidePanel"
        >
          Gizle
        </button>
      </div>
    </div>

    <div class="mt-4 text-sm text-gray-600" v-if="linkedProjectName">
      Aktif Proje: <span class="font-medium text-gray-800">{{ linkedProjectName }}</span>
    </div>

    <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label class="flex flex-col text-sm font-medium text-gray-700">
        Odak Süresi (dk)
        <input
          v-model.number="workDurationInput"
          type="number"
          min="1"
          class="mt-2 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </label>
      <label class="flex flex-col text-sm font-medium text-gray-700">
        Mola Süresi (dk)
        <input
          v-model.number="breakDurationInput"
          type="number"
          min="1"
          class="mt-2 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </label>
    </div>

    <div class="mt-8 text-center">
      <div class="text-5xl font-bold text-gray-900 tracking-widest">{{ formattedTime }}</div>
      <div class="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-blue-500 transition-all"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <p class="mt-2 text-sm text-gray-500">
        {{ phaseDescription }}
      </p>
    </div>

    <div class="mt-8 flex flex-wrap gap-3 justify-center">
      <button
        @click="handleStartPause"
        class="px-4 py-2 rounded-lg text-white font-medium"
        :class="isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'"
      >
        {{ isActive ? 'Duraklat' : 'Başlat' }}
      </button>
      <button
        @click="handleReset"
        class="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium"
      >
        Sıfırla
      </button>
      <button
        @click="handlePhaseToggle"
        class="px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium"
      >
        Aşama Değiştir
      </button>
    </div>

    <div class="mt-8">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>Toplam Odak Seansı</span>
        <span class="font-semibold text-gray-800">{{ completedSessions }}</span>
      </div>
      <div class="mt-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Son Seanslar</h3>
        <ul class="space-y-2 max-h-40 overflow-y-auto pr-1">
          <li
            v-for="session in recentSessions"
            :key="session.id"
            class="flex items-center justify-between text-sm text-gray-600"
          >
            <div>
              <p class="font-medium text-gray-800">{{ formatSessionDate(session.completedAt) }}</p>
              <p class="text-xs text-gray-500">
                Odak: {{ session.focusDuration }} dk · Mola: {{ session.breakDuration }} dk
              </p>
            </div>
            <span v-if="session.projectName" class="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
              {{ session.projectName }}
            </span>
          </li>
          <li v-if="!recentSessions.length" class="text-sm text-gray-400 text-center py-2">
            Henüz seans kaydı bulunmuyor.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useProjectStore } from '@/stores/projectStore'

const emit = defineEmits<{ (e: 'hide'): void }>()

const pomodoroStore = usePomodoroStore()
const projectStore = useProjectStore()

const {
  workDuration,
  breakDuration,
  remainingSeconds,
  currentPhase,
  isActive,
  completedSessions,
  sessionHistory,
  linkedProjectName,
  linkedProjectId
} = storeToRefs(pomodoroStore)

const workDurationInput = ref(workDuration.value)
const breakDurationInput = ref(breakDuration.value)
const isHydrated = ref(false)

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const phaseLabel = computed(() => (currentPhase.value === 'focus' ? 'Odak' : 'Mola'))
const phaseDescription = computed(() =>
  currentPhase.value === 'focus'
    ? 'Şimdi odaklanma zamanı!'
    : 'Kısa bir mola verin ve rahatlayın.'
)

const progress = computed(() => {
  const total = currentPhase.value === 'focus'
    ? workDuration.value * 60
    : breakDuration.value * 60
  if (total === 0) {
    return 0
  }
  const elapsed = total - remainingSeconds.value
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
})

const recentSessions = computed(() => sessionHistory.value.slice(0, 5))

const handleStartPause = () => {
  if (isActive.value) {
    pomodoroStore.pauseTimer()
  } else {
    pomodoroStore.startTimer()
  }
}

const handleReset = () => {
  pomodoroStore.resetTimer()
}

const handlePhaseToggle = () => {
  pomodoroStore.togglePhase(true)
}

const handleHidePanel = () => {
  pomodoroStore.pauseTimer()
  emit('hide')
}

const formatSessionDate = (dateIso: string) => {
  if (!dateIso) {
    return ''
  }
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    }).format(new Date(dateIso))
  } catch (error) {
    console.warn('Tarih formatlanırken hata oluştu:', error)
    return dateIso
  }
}

watch(workDurationInput, (value) => {
  if (Number.isFinite(value)) {
    pomodoroStore.setWorkDuration(value)
  }
})

watch(breakDurationInput, (value) => {
  if (Number.isFinite(value)) {
    pomodoroStore.setBreakDuration(value)
  }
})

watch(workDuration, (value) => {
  if (workDurationInput.value !== value) {
    workDurationInput.value = value
  }
})

watch(breakDuration, (value) => {
  if (breakDurationInput.value !== value) {
    breakDurationInput.value = value
  }
})

watch(
  () => [projectStore.selectedProjectId, projectStore.selectedProjectName] as const,
  ([projectId, projectName]) => {
    if (!isHydrated.value) {
      return
    }

    if (projectId !== null) {
      pomodoroStore.linkProject(projectId, projectName ?? null)
    } else if (linkedProjectId.value !== null) {
      pomodoroStore.linkProject(null, null)
    }
  }
)

onMounted(() => {
  pomodoroStore.initializeFromStorage()
  isHydrated.value = true

  if (projectStore.selectedProjectId !== null) {
    pomodoroStore.linkProject(projectStore.selectedProjectId, projectStore.selectedProjectName)
  }
})

onBeforeUnmount(() => {
  pomodoroStore.pauseTimer()
})
</script>
