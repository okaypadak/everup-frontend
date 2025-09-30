<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">
          <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
            <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
            Proje Toplantısı Oluştur
          </h1>

          <form class="space-y-6" @submit.prevent="submitMeeting">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                Proje
                <span v-if="loadingProjects" class="text-xs text-sky-600">Yükleniyor...</span>
              </label>
              <select
                  v-model="form.projectId"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  required
              >
                <option value="">-- Proje Seçin --</option>
                <option
                    v-for="project in projects"
                    :key="project.id"
                    :value="String(project.id)"
                >
                  {{ project.name }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Toplantı Başlığı</label>
                <input
                    v-model="form.title"
                    type="text"
                    placeholder="Örn: Sprint Planlama"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Konum (Opsiyonel)</label>
                <input
                    v-model="form.location"
                    type="text"
                    placeholder="Örn: Toplantı Odası / Teams"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                <input
                    v-model="form.meetingDate"
                    type="date"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                <input
                    v-model="form.meetingTime"
                    type="time"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gündem</label>
              <textarea
                  v-model="form.agenda"
                  rows="3"
                  placeholder="Toplantıda konuşulacak ana başlıkları yazın"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notlar (Opsiyonel)</label>
              <textarea
                  v-model="form.notes"
                  rows="3"
                  placeholder="Toplantıya ilişkin ek notlar"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Katılımcılar
                <span v-if="loadingMembers" class="text-xs text-sky-600">Yükleniyor...</span>
              </label>
              <div v-if="!selectedProjectId" class="text-gray-500 text-sm">
                Önce toplantıyı ilişkilendirmek istediğiniz projeyi seçin.
              </div>
              <div v-else-if="projectMembers.length === 0" class="text-gray-500 text-sm">
                Bu projeye henüz katılımcı eklenmemiş.
              </div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label
                    v-for="member in projectMembers"
                    :key="member.id"
                    class="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-transparent hover:border-sky-300 transition"
                >
                  <input
                      type="checkbox"
                      :value="String(member.id)"
                      v-model="form.attendees"
                      class="text-sky-600"
                  />
                  <span class="text-sm text-gray-700">
                    {{ formatMemberName(member) }}
                    <span v-if="member.email" class="block text-xs text-gray-500">{{ member.email }}</span>
                  </span>
                </label>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                  type="submit"
                  class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Kaydediliyor...</span>
                <span v-else>Toplantı Oluştur</span>
              </button>
            </div>
          </form>
        </div>

        <div v-if="selectedProjectId" class="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-sky-700 flex items-center gap-2">
              <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
              </svg>
              Planlanan Toplantılar
            </h2>
            <span v-if="isLoadingMeetings" class="text-xs text-sky-600">Yükleniyor...</span>
          </div>

          <div v-if="!isLoadingMeetings && meetings.length === 0" class="text-gray-500 text-sm">
            Bu proje için henüz toplantı oluşturulmamış.
          </div>

          <div v-else class="space-y-4">
            <div
                v-for="meeting in meetings"
                :key="String(meeting.id || meeting.title || meeting.scheduledAt || Math.random())"
                class="p-4 bg-blue-50 rounded-lg shadow-sm"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">{{ meeting.title || 'İsimsiz toplantı' }}</h3>
                  <p class="text-sm text-gray-600" v-if="meeting.location">Konum: {{ meeting.location }}</p>
                </div>
                <div class="text-sm text-sky-700 font-medium">
                  {{ formatMeetingSchedule(meeting) }}
                </div>
              </div>

              <p v-if="meeting.agenda || meeting.description" class="text-sm text-gray-700 mt-2">
                {{ meeting.agenda || meeting.description }}
              </p>

              <p v-if="meeting.notes" class="text-sm text-gray-600 mt-2">Not: {{ meeting.notes }}</p>

              <div class="mt-3">
                <h4 class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Katılımcılar</h4>
                <p class="text-sm text-gray-700 mt-1">{{ extractAttendeeNames(meeting) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import Navbar from '~/pages/components/bar/Navbar.vue'

interface ProjectSummary {
  id: number
  name: string
  description?: string
}

interface ProjectMember {
  id?: number | string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
}

interface ProjectMeeting {
  id?: number | string
  title?: string
  agenda?: string
  description?: string
  scheduledAt?: string
  scheduled_at?: string
  meetingDate?: string
  meetingTime?: string
  location?: string
  notes?: string
  attendees?: ProjectMember[]
  participants?: ProjectMember[]
  invitees?: ProjectMember[]
  members?: ProjectMember[]
}

interface MeetingFormState {
  projectId: string
  title: string
  agenda: string
  meetingDate: string
  meetingTime: string
  location: string
  attendees: string[]
  notes: string
}

const projects = ref<ProjectSummary[]>([])
const projectMembers = ref<ProjectMember[]>([])
const meetings = ref<ProjectMeeting[]>([])

const loadingProjects = ref(false)
const loadingMembers = ref(false)
const isLoadingMeetings = ref(false)
const isSubmitting = ref(false)

const form = reactive<MeetingFormState>({
  projectId: '',
  title: '',
  agenda: '',
  meetingDate: '',
  meetingTime: '',
  location: '',
  attendees: [],
  notes: ''
})

const selectedProjectId = computed(() => (form.projectId ? Number(form.projectId) : null))

watch(selectedProjectId, async (projectId) => {
  if (!projectId) {
    projectMembers.value = []
    meetings.value = []
    form.attendees = []
    return
  }

  await Promise.all([loadProjectMembers(projectId), loadMeetings(projectId)])
})

onMounted(async () => {
  await loadProjects()
})

async function loadProjects() {
  loadingProjects.value = true
  try {
    const response = await $fetch<ProjectSummary[] | { projects: ProjectSummary[] }>('/api/projects')

    if (Array.isArray(response)) {
      projects.value = response
    } else if (Array.isArray(response?.projects)) {
      projects.value = response.projects
    } else {
      projects.value = []
    }

    if (!form.projectId && projects.value.length === 1) {
      form.projectId = String(projects.value[0].id)
    }
  } catch (error) {
    console.error('Projeler alınamadı:', error)
    toast.error('Projeler alınırken bir hata oluştu')
  } finally {
    loadingProjects.value = false
  }
}

async function loadProjectMembers(projectId: number) {
  loadingMembers.value = true
  try {
    const response = await $fetch<{ members?: ProjectMember[]; data?: ProjectMember[] } | ProjectMember[]>(`/api/projects/${projectId}/users`)

    if (Array.isArray(response)) {
      projectMembers.value = response
    } else if (Array.isArray(response?.members)) {
      projectMembers.value = response.members
    } else if (Array.isArray(response?.data)) {
      projectMembers.value = response.data
    } else {
      projectMembers.value = []
    }
  } catch (error) {
    console.error('Katılımcılar getirilemedi:', error)
    toast.error('Proje katılımcıları yüklenemedi')
    projectMembers.value = []
  } finally {
    loadingMembers.value = false
  }
}

async function loadMeetings(projectId: number) {
  isLoadingMeetings.value = true
  try {
    const response = await $fetch<ProjectMeeting[] | { meetings?: ProjectMeeting[]; data?: ProjectMeeting[] }>(`/api/projects/${projectId}/meetings`)

    if (Array.isArray(response)) {
      meetings.value = response
    } else if (Array.isArray(response?.meetings)) {
      meetings.value = response.meetings
    } else if (Array.isArray(response?.data)) {
      meetings.value = response.data
    } else {
      meetings.value = []
    }
  } catch (error) {
    console.error('Toplantılar getirilemedi:', error)
    toast.error('Toplantılar alınırken bir hata oluştu')
    meetings.value = []
  } finally {
    isLoadingMeetings.value = false
  }
}

function formatMemberName(member: ProjectMember) {
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ').trim()
  if (fullName) {
    return fullName
  }
  if (member.name) {
    return member.name
  }
  if (member.email) {
    return member.email
  }
  return `#${member.id}`
}

function formatMeetingSchedule(meeting: ProjectMeeting) {
  const candidateValues = [
    meeting.scheduledAt,
    meeting.scheduled_at,
    meeting.meetingDate && meeting.meetingTime ? `${meeting.meetingDate}T${meeting.meetingTime}` : null,
    meeting.meetingDate
  ].filter(Boolean) as string[]

  for (const value of candidateValues) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('tr-TR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    }
  }

  return 'Planlanan zaman bilgisi yok'
}

function extractAttendeeNames(meeting: ProjectMeeting) {
  const pools = [meeting.attendees, meeting.participants, meeting.invitees, meeting.members]
  const attendees = pools.find((pool) => Array.isArray(pool)) as ProjectMember[] | undefined

  if (!attendees || attendees.length === 0) {
    return 'Katılımcı bilgisi yok'
  }

  return attendees
    .map((person) => {
      if (!person) return null
      const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ').trim()
      if (fullName) return fullName
      if (person.name) return person.name
      if (person.email) return person.email
      return person.id ? `#${person.id}` : null
    })
    .filter(Boolean)
    .join(', ')
}

async function submitMeeting() {
  if (!selectedProjectId.value) {
    toast.warn('Lütfen toplantıyı ilişkilendirmek için bir proje seçin.')
    return
  }

  if (!form.title.trim()) {
    toast.warn('Toplantı başlığı zorunludur.')
    return
  }

  isSubmitting.value = true

  try {
    const attendeeIds = form.attendees.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
    const payload: Record<string, any> = {
      projectId: selectedProjectId.value,
      title: form.title.trim()
    }

    if (form.agenda.trim()) {
      payload.agenda = form.agenda.trim()
    }

    if (form.location.trim()) {
      payload.location = form.location.trim()
    }

    if (form.notes.trim()) {
      payload.notes = form.notes.trim()
    }

    if (form.meetingDate) {
      payload.meetingDate = form.meetingDate
    }

    if (form.meetingTime) {
      payload.meetingTime = form.meetingTime
    }

    if (form.meetingDate) {
      const isoString = buildIsoDate(form.meetingDate, form.meetingTime)
      if (isoString) {
        payload.scheduledAt = isoString
      }
    }

    if (attendeeIds.length) {
      payload.attendeeIds = attendeeIds
    }

    await $fetch(`/api/projects/${selectedProjectId.value}/meetings`, {
      method: 'POST',
      body: payload
    })

    toast.success('Toplantı başarıyla oluşturuldu')

    const preservedProject = form.projectId

    form.title = ''
    form.agenda = ''
    form.meetingDate = ''
    form.meetingTime = ''
    form.location = ''
    form.attendees = []
    form.notes = ''
    form.projectId = preservedProject

    await loadMeetings(selectedProjectId.value)
  } catch (error) {
    console.error('Toplantı oluşturma başarısız:', error)
    toast.error('Toplantı oluşturulurken bir hata oluştu')
  } finally {
    isSubmitting.value = false
  }
}

function buildIsoDate(date: string, time?: string) {
  if (!date) {
    return null
  }

  const normalizedTime = time && time.trim() ? time : '00:00'
  const isoCandidate = new Date(`${date}T${normalizedTime}`)

  if (Number.isNaN(isoCandidate.getTime())) {
    return null
  }

  return isoCandidate.toISOString()
}
</script>

<style scoped>
@reference 'tailwindcss';
.nav-link {
  @apply text-sm font-medium text-gray-600 hover:text-sky-600 transition;
}

.dropdown-panel {
  @apply absolute mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2;
}

.dropdown-item {
  @apply block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700;
}
</style>
