<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <main class="flex-1 w-full">
      <div class="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <header class="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 space-y-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 class="text-3xl font-bold text-sky-700 flex items-center gap-3">
                <span class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 text-sky-600 shadow-inner">
                  🧭
                </span>
                Proje Timeline’ı
              </h1>
              <p class="mt-2 text-slate-600 max-w-2xl">
                Seçtiğiniz proje için eklenen görevler, dökümanlar, toplantılar, yorumlar ve sprintlerin tamamını tek bir zaman çizgisinde takip edin.
              </p>
            </div>

            <div class="flex flex-col gap-3 w-full md:w-auto">
              <label class="text-sm font-semibold text-slate-600" for="project-select">
                Proje Seçin
              </label>
              <select
                id="project-select"
                v-model="selectedProjectId"
                class="w-full md:w-72 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:bg-white"
              >
                <option disabled value="">
                  Bir proje seçin
                </option>
                <option
                  v-for="project in projects"
                  :key="project.id"
                  :value="project.id"
                >
                  {{ project.name }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="stats" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="item in statItems"
              :key="item.title"
              class="rounded-2xl border border-slate-200 shadow-sm p-4 bg-gradient-to-br"
              :class="accentClasses[item.accent]"
            >
              <div class="flex items-center justify-between">
                <span class="text-3xl">{{ item.icon }}</span>
                <span class="text-2xl font-bold">{{ item.value }}</span>
              </div>
              <p class="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-600">{{ item.title }}</p>
            </div>
          </div>
        </header>

        <section class="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 space-y-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="category in categoryOrder"
                :key="category"
                type="button"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition"
                :class="[
                  activeCategories.has(category)
                    ? 'bg-sky-100 text-sky-700 border-sky-300'
                    : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
                ]"
                @click="toggleCategory(category)"
              >
                <span>{{ categoryIcons[category] }}</span>
                {{ categoryLabels[category] }}
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                @click="resetFilters"
              >
                Filtreleri Sıfırla
              </button>
              <button
                type="button"
                class="px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                @click="toggleSort"
              >
                {{ sortDirection === 'desc' ? 'Yeni önce' : 'Eski önce' }}
              </button>
            </div>
          </div>

          <div v-if="loading" class="flex items-center justify-center py-16 text-sky-600 gap-3">
            <svg class="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Timeline yükleniyor...
          </div>

          <p v-else-if="!selectedProjectId" class="py-10 text-center text-slate-500">
            Timeline’ı görüntülemek için önce bir proje seçin.
          </p>

          <div v-else-if="errorMessage" class="py-10 text-center text-rose-500 font-semibold">
            {{ errorMessage }}
          </div>

          <p v-else-if="visibleEvents.length === 0" class="py-10 text-center text-slate-500">
            Seçilen filtrelere uygun timeline kaydı bulunamadı.
          </p>

          <div v-else class="relative">
            <div class="absolute top-0 bottom-0 left-5 hidden md:block w-px bg-gradient-to-b from-sky-200 via-slate-200 to-slate-100"></div>
            <ol class="space-y-10">
              <li
                v-for="group in groupedEvents"
                :key="group.dateKey"
                class="space-y-4"
              >
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sky-50 text-sky-600 shadow-inner">🕒</span>
                    {{ group.displayDate }}
                  </div>
                  <div class="hidden md:block flex-1 h-px bg-slate-200"></div>
                </div>

                <ul class="space-y-6">
                  <li
                    v-for="event in group.items"
                    :key="event.id"
                    class="relative md:pl-16 pl-10"
                  >
                    <span
                      class="absolute left-0 md:left-3 top-2 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-md"
                      :class="iconBackgrounds[event.category]"
                    >
                      {{ categoryIcons[event.category] }}
                    </span>

                    <div class="bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 rounded-2xl shadow-sm px-5 py-4 space-y-3">
                      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p class="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                            {{ eventTypeLabels[event.eventType] ?? event.eventType }}
                          </p>
                          <h3 class="text-lg font-semibold text-slate-800">
                            {{ event.title }}
                          </h3>
                        </div>
                        <span class="text-sm font-medium text-slate-500">
                          {{ formatTime(event.date) }}
                        </span>
                      </div>

                      <p v-if="event.description" class="text-sm text-slate-600 leading-relaxed">
                        {{ event.description }}
                      </p>

                      <div v-if="event.meta && metaSummary(event.meta)" class="text-xs text-slate-500 bg-slate-100/80 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                        <span class="font-semibold">Detay:</span>
                        <span>{{ metaSummary(event.meta) }}</span>
                      </div>

                      <NuxtLink
                        v-if="event.link"
                        :to="event.link"
                        class="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
                      >
                        Detaya git
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </NuxtLink>
                    </div>
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Navbar from '@/pages/components/bar/Navbar.vue'
import { useProjectStore } from '@/stores/projectStore'

interface Project {
  id: number
  name: string
}

interface TimelineEvent {
  id: string
  category: 'task' | 'document' | 'meeting' | 'comment' | 'sprint'
  eventType: string
  title: string
  description?: string
  date: string
  link?: string
  meta?: Record<string, any>
}

interface TimelineStats {
  tasksCreated: number
  tasksCompleted: number
  documentsAdded: number
  meetingsHeld: number
  commentsAdded: number
  sprintsStarted: number
  sprintsCompleted: number
}

const projects = ref<Project[]>([])
const projectStore = useProjectStore()
const selectedProjectId = ref<number | ''>(projectStore.selectedProjectId ?? '')
const events = ref<TimelineEvent[]>([])
const stats = ref<TimelineStats | null>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('desc')

const categoryLabels = {
  task: 'Görevler',
  document: 'Dökümanlar',
  meeting: 'Toplantılar',
  comment: 'Yorumlar',
  sprint: 'Sprintler',
} as const

const categoryIcons = {
  task: '🗂',
  document: '📄',
  meeting: '🗓',
  comment: '💬',
  sprint: '🚀',
} as const

const iconBackgrounds: Record<TimelineEvent['category'], string> = {
  task: 'bg-sky-100 text-sky-600',
  document: 'bg-violet-100 text-violet-600',
  meeting: 'bg-amber-100 text-amber-600',
  comment: 'bg-rose-100 text-rose-600',
  sprint: 'bg-emerald-100 text-emerald-600',
}

const eventTypeLabels: Record<string, string> = {
  created: 'Oluşturuldu',
  completed: 'Tamamlandı',
  scheduled: 'Planlandı',
  commented: 'Yorum',
  started: 'Başladı',
}

const categoryOrder: Array<TimelineEvent['category']> = ['task', 'document', 'meeting', 'comment', 'sprint']
const activeCategories = ref(new Set<TimelineEvent['category']>(categoryOrder))

type AccentKey = 'sky' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'lime'

const accentClasses: Record<AccentKey, string> = {
  sky: 'from-sky-500/10 to-sky-500/5 text-sky-700',
  emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-700',
  violet: 'from-violet-500/10 to-violet-500/5 text-violet-700',
  amber: 'from-amber-500/10 to-amber-500/5 text-amber-700',
  rose: 'from-rose-500/10 to-rose-500/5 text-rose-700',
  cyan: 'from-cyan-500/10 to-cyan-500/5 text-cyan-700',
  lime: 'from-lime-500/10 to-lime-500/5 text-lime-700',
}

const statItems = computed(() => {
  if (!stats.value) return [] as Array<{ icon: string; title: string; value: number; accent: AccentKey }>
  return [
    { icon: '🗂', title: 'Oluşturulan Görev', value: stats.value.tasksCreated, accent: 'sky' as AccentKey },
    { icon: '✅', title: 'Tamamlanan Görev', value: stats.value.tasksCompleted, accent: 'emerald' as AccentKey },
    { icon: '📄', title: 'Eklenen Döküman', value: stats.value.documentsAdded, accent: 'violet' as AccentKey },
    { icon: '🗓', title: 'Planlanan Toplantı', value: stats.value.meetingsHeld, accent: 'amber' as AccentKey },
    { icon: '💬', title: 'Yeni Yorum', value: stats.value.commentsAdded, accent: 'rose' as AccentKey },
    { icon: '🚀', title: 'Başlayan Sprint', value: stats.value.sprintsStarted, accent: 'cyan' as AccentKey },
    { icon: '🏁', title: 'Tamamlanan Sprint', value: stats.value.sprintsCompleted, accent: 'lime' as AccentKey },
  ]
})

const visibleEvents = computed(() => {
  const filtered = events.value.filter(event => activeCategories.value.has(event.category))
  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
    return sortDirection.value === 'asc' ? diff : -diff
  })
  return sorted
})

const groupedEvents = computed(() => {
  const groups: Array<{ dateKey: string; displayDate: string; items: TimelineEvent[] }> = []
  const formatter = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const map = new Map<string, { displayDate: string; items: TimelineEvent[] }>()
  for (const event of visibleEvents.value) {
    const key = event.date.slice(0, 10)
    if (!map.has(key)) {
      map.set(key, {
        displayDate: formatter.format(new Date(event.date)),
        items: [],
      })
    }
    map.get(key)!.items.push(event)
  }

  const sortedKeys = Array.from(map.keys()).sort((a, b) => {
    const diff = new Date(a).getTime() - new Date(b).getTime()
    return sortDirection.value === 'asc' ? diff : -diff
  })

  for (const key of sortedKeys) {
    groups.push({ dateKey: key, displayDate: map.get(key)!.displayDate, items: map.get(key)!.items })
  }

  return groups
})

function formatTime(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function metaSummary(meta: Record<string, any>) {
  if ('deadline' in meta && meta.deadline) {
    return `Bitiş hedefi: ${new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(meta.deadline))}`
  }
  if ('meetingId' in meta) return `Toplantı ID: ${meta.meetingId}`
  if ('documentId' in meta) return `Döküman ID: ${meta.documentId}`
  if ('taskId' in meta && 'commentId' in meta) return `Görev #${meta.taskId} yorum #${meta.commentId}`
  if ('taskId' in meta) return `Görev ID: ${meta.taskId}`
  if ('sprintId' in meta) return `Sprint ID: ${meta.sprintId}`
  return ''
}

function toggleCategory(category: TimelineEvent['category']) {
  const next = new Set(activeCategories.value)
  if (next.has(category)) {
    next.delete(category)
  } else {
    next.add(category)
  }
  if (next.size === 0) {
    // En az bir filtre açık kalsın
    next.add(category)
  }
  activeCategories.value = next
}

function resetFilters() {
  activeCategories.value = new Set(categoryOrder)
}

function toggleSort() {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
}

async function loadProjects() {
  try {
    const response = await $fetch<Project[]>('/api/projects')
    projects.value = response || []

    if (!selectedProjectId.value && projects.value.length === 1) {
      selectedProjectId.value = projects.value[0].id
    }
  } catch (error) {
    console.error('Projeler alınamadı:', error)
  }
}

async function loadTimeline(projectId: number) {
  loading.value = true
  errorMessage.value = null

  try {
    const response = await $fetch<{ events: TimelineEvent[]; stats: TimelineStats }>(`/api/projects/${projectId}/timeline`)
    events.value = response.events
    stats.value = response.stats
  } catch (error: any) {
    console.error('Timeline yüklenemedi:', error)
    errorMessage.value = error?.data?.message || 'Timeline bilgisi alınamadı.'
    events.value = []
    stats.value = null
  } finally {
    loading.value = false
  }
}

watch(selectedProjectId, (value) => {
  const numericId = typeof value === 'number' ? value : Number(value)

  if (!numericId) {
    events.value = []
    stats.value = null
    projectStore.clearProject()
    return
  }
  const project = projects.value.find(p => p.id === numericId)
  if (project) {
    projectStore.setProject(project.id, project.name)
  } else {
    projectStore.setProject(numericId, '')
  }
  loadTimeline(numericId)
})

onMounted(async () => {
  await loadProjects()
  const numericId = typeof selectedProjectId.value === 'number'
    ? selectedProjectId.value
    : Number(selectedProjectId.value)

  if (numericId) {
    loadTimeline(numericId)
  }
})
</script>
