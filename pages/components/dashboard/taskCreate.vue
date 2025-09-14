<template>
  <div class="bg-white rounded-xl p-4 shadow flex flex-col gap-4 h-full overflow-y-auto min-h-0">
    <!-- Başlık -->
    <div class="flex items-center gap-2 mb-2 text-xl font-bold text-gray-700">
      <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h8m-8 5h16" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Görev/Hata Oluşturma
    </div>

    <!-- Sekmeler -->
    <div class="flex gap-2 border-b border-gray-200">
      <button
          class="px-4 py-2 -mb-px border-b-2"
          :class="activeTab === 'single'
          ? 'border-blue-500 text-blue-600 font-semibold'
          : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'single'"
      >
        Tekil Oluştur
      </button>
      <button
          class="px-4 py-2 -mb-px border-b-2"
          :class="activeTab === 'bulk'
          ? 'border-blue-500 text-blue-600 font-semibold'
          : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'bulk'"
      >
        Toplu (JSON)
      </button>
    </div>

    <!-- TAB İÇERİKLERİ -->
    <div v-if="activeTab === 'single'" class="flex flex-col gap-4">
      <!-- Proje Seç -->
      <label class="block">
        <span class="block text-gray-700 text-base font-semibold mb-1">Proje Seç</span>
        <select
            v-model="selectedProject"
            class="block w-full mt-1 rounded-md border border-gray-300 bg-gray-100 text-gray-700 shadow-sm px-3 py-2"
        >
          <option value="">Proje seçiniz</option>
          <option v-for="p in projects" :key="p.id" :value="String(p.id)">{{ p.name }}</option>
        </select>
      </label>

      <!-- Tür -->
      <label class="block">
        <span class="block text-gray-700 text-base font-semibold mb-1">Tür</span>
        <select
            v-model="newTaskType"
            class="block w-full mt-1 rounded-md border border-gray-300 bg-gray-50 text-gray-700 shadow-sm px-3 py-2"
        >
          <option value="">Tür Seçiniz</option>
          <option value="task">Görev</option>
          <option value="bug">Hata</option>
          <option value="test">Test</option>
          <option value="approval">Onay</option>
        </select>
      </label>

      <!-- Kişi Arama ve Seç -->
      <label class="block">
        <input
            v-model="userSearch"
            class="mb-2 w-full rounded px-2 py-1 border border-gray-300 text-black focus:ring-2 focus:ring-blue-200"
            placeholder="Kişi ara..."
            autocomplete="off"
            type="text"
        >
        <span class="block text-gray-700 text-base font-semibold mb-1">Atanacak Kişi</span>
        <select
            v-model="assignedUser"
            class="block w-full mt-1 rounded-md border border-gray-300 bg-gray-50 text-gray-700 shadow-sm px-3 py-2"
        >
          <option value="" disabled>Kişi seçiniz</option>
          <option v-for="user in filteredUsers" :key="user.id" :value="String(user.id)">{{ user.name }}</option>
        </select>
      </label>

      <!-- Seviye -->
      <label class="block">
        <span class="block text-gray-700 text-base font-semibold mb-1">Seviye</span>
        <select
            v-model="newTaskLevel"
            class="block w-full mt-1 rounded-md border border-gray-300 bg-gray-50 text-gray-700 shadow-sm px-3 py-2"
        >
          <template v-if="newTaskType === 'task'">
            <option value="normal">Normal</option>
            <option value="priority">Öncelikli</option>
          </template>
          <template v-else>
            <option value="normal">Normal</option>
            <option value="critical">Kritik</option>
          </template>
        </select>
      </label>

      <!-- Etiketler -->
      <div v-if="projectLabels.length > 0" class="block">
        <span class="block text-gray-700 text-base font-semibold mb-1">Etiketler</span>
        <div class="flex flex-wrap gap-2 mt-1">
          <button
              v-for="label in projectLabels"
              :key="label.id"
              type="button"
              @click="toggleLabel(label.id)"
              :class="[
              'text-xs font-semibold px-3 py-1 rounded-full border transition-all',
              selectedLabels.includes(label.id)
                ? 'bg-green-500 text-white border-green-600'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-green-100'
            ]"
          >
            {{ label.name }}
          </button>
        </div>
      </div>

      <!-- Çoklu Bağlı Görev -->
      <label v-if="newTaskType === 'task'" class="block">
        <span class="block text-gray-700 text-base font-semibold mb-1">Bağlı Görevler</span>
        <select
            v-model="bagliGorevler"
            multiple
            class="block w-full mt-1 rounded-md border border-gray-300 bg-gray-50 text-gray-700 shadow-sm px-3 py-2 h-32"
        >
          <option v-for="g in tumGorevler" :key="g.id" :value="g.id">{{ g.title }}</option>
        </select>
      </label>

      <!-- Deadline -->
      <label class="block">
        <span class="block text-gray-700 text-base font-semibold mb-1">Bitiş Tarihi</span>
        <input
            v-model="newTaskDeadline"
            type="date"
            class="rounded-md bg-gray-100 px-3 py-2 font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
      </label>

      <!-- Başlık -->
      <input
          v-model="newTaskTitle"
          placeholder="Yeni görev başlığı"
          class="rounded-md bg-gray-100 px-3 py-2 font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >

      <!-- Açıklama -->
      <textarea
          v-model="newTaskDesc"
          rows="10"
          placeholder="Açıklama"
          class="rounded-md bg-gray-100 px-3 py-2 resize-none border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[300px]"
      />

      <!-- Görev Oluştur Butonu -->
      <button
          :disabled="isSingleDisabled"
          :class="[
          'inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold py-2 px-6 rounded-xl shadow-md active:scale-95 transition-all duration-150',
          isSingleDisabled ? 'opacity-50' : 'hover:from-blue-500 hover:to-green-500 hover:shadow-lg'
        ]"
          @click="addTaskLocal"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Görev Oluştur
      </button>
    </div>

    <!-- BULK TAB -->
    <div v-else class="flex flex-col gap-4">
      <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm leading-6">
        <div class="font-semibold text-blue-700 mb-1">JSON formatı</div>
        <p class="text-blue-800">
          Aşağıya bir <b>dizi</b> halinde görevler gir. Zorunlu alanlar:
          <code class="bg-white/70 px-1 rounded">title</code>,
          <code class="bg-white/70 px-1 rounded">assignedTo</code>,
          <code class="bg-white/70 px-1 rounded">project</code>.
          Opsiyoneller:
          <code class="bg-white/70 px-1 rounded">type</code>,
          <code class="bg-white/70 px-1 rounded">level</code>,
          <code class="bg-white/70 px-1 rounded">deadline</code> (YYYY-MM-DD),
          <code class="bg-white/70 px-1 rounded">dependencyIds</code>,
          <code class="bg-white/70 px-1 rounded">labelIds</code>,
          <code class="bg-white/70 px-1 rounded">description</code>.
        </p>
        <div class="mt-2">
          <button class="text-xs underline" @click="pasteTemplate">Örnek şablonu yapıştır</button>
        </div>
      </div>

      <textarea
          v-model="bulkJson"
          rows="16"
          spellcheck="false"
          class="rounded-md bg-gray-100 px-3 py-2 border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-200 font-mono text-sm"
          placeholder='[ { "title": "…", "assignedTo": 1, "project": 1 } ]'
      />

      <!-- Hata listesi -->
      <div v-if="bulkErrors.length" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
        <div class="font-semibold text-red-700 mb-1">Hatalar</div>
        <ul class="list-disc ml-5 text-red-800 space-y-1">
          <li v-for="(e, i) in bulkErrors" :key="i">{{ e }}</li>
        </ul>
      </div>

      <div class="flex items-center gap-3">
        <button
            :disabled="isBulkSubmitting"
            :class="[
            'inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold py-2 px-6 rounded-xl shadow-md active:scale-95 transition-all duration-150',
            isBulkSubmitting ? 'opacity-50' : 'hover:from-blue-500 hover:to-green-500 hover:shadow-lg'
          ]"
            @click="submitBulk"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Toplu Görev Oluştur
        </button>
        <span v-if="bulkSummary" class="text-sm text-gray-600">{{ bulkSummary }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useTaskStore } from '@/stores/taskStore'

const emit = defineEmits(['add-task'])

interface Project { id: number; name: string }
interface User { id: number; name: string }
interface Task { id: number | string; title: string; status: string; type: string; level: string; assignedTo: number; project: number; deadline: string | null; dependencyIds: number[]; labelIds: number[]; description: string; }
interface TaskLabel { id: number; name: string }

const taskStore = useTaskStore()

/** Tabs */
const activeTab = ref<'single' | 'bulk'>('single')

/** Tekil form state */
const selectedProject = ref<string>('')
const assignedUser = ref<string>('')
const userSearch = ref('')
const newTaskType = ref<'task' | 'bug' | 'test' | 'approval' | ''>('task')
const newTaskLevel = ref<'normal' | 'priority' | 'critical' | ''>('normal')
const newTaskTitle = ref('')
const newTaskDesc = ref('')
const newTaskDeadline = ref('')
const bagliGorevler = ref<(string | number)[]>([])
const selectedLabels = ref<number[]>([])

const projects = ref<Project[]>([])
const allUsers = ref<User[]>([])
const tumGorevler = ref<Task[]>([])
const projectLabels = ref<TaskLabel[]>([])

/** Bulk state */
const bulkJson = ref('')
const bulkErrors = ref<string[]>([])
const isBulkSubmitting = ref(false)
const bulkSummary = ref('')

/** Disable controls */
const isSingleDisabled = computed(() => !newTaskTitle.value || !selectedProject.value || !assignedUser.value)

/** Lifecycle */
onMounted(async () => {
  try {
    const data = await $fetch<Project[]>('/api/projects')
    projects.value = data
  } catch (err) {
    console.error('Projeler yüklenemedi:', err)
  }
})

watch(() => selectedProject.value, async (newId) => {
  if (!newId) return

  try {
    const projectUsers = await $fetch<{ id: number; members: any[] }>(`/api/projects/${newId}/users`)
    allUsers.value = projectUsers.members.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))
  } catch (err) {
    console.error('Kullanıcılar yüklenemedi:', err)
  }

  try {
    const taskList = await $fetch<Task[]>(`/api/tasks/project/${newId}`)
    tumGorevler.value = taskList.filter(task => task.status !== 'completed')
  } catch (err) {
    console.error('Görevler yüklenemedi:', err)
  }

  try {
    const labels = await $fetch<TaskLabel[]>(`/api/task-labels/${newId}`, { credentials: 'include' })
    projectLabels.value = labels
  } catch (err) {
    console.error('Etiketler yüklenemedi:', err)
    projectLabels.value = []
  }
})

/** Computeds */
const filteredUsers = computed(() => {
  if (!userSearch.value) return allUsers.value
  return allUsers.value.filter(u =>
      u.name.toLowerCase().includes(userSearch.value.toLowerCase())
  )
})

/** Actions - Single */
function toggleLabel(labelId: number) {
  if (selectedLabels.value.includes(labelId)) {
    selectedLabels.value = selectedLabels.value.filter(id => id !== labelId)
  } else {
    selectedLabels.value.push(labelId)
  }
}

function addTaskLocal() {
  const payload = {
    title: newTaskTitle.value.trim(),
    description: newTaskDesc.value?.trim() || '',
    assignedTo: Number(assignedUser.value),
    project: Number(selectedProject.value),
    type: newTaskType.value || 'task',
    level: newTaskLevel.value || 'normal',
    deadline: newTaskDeadline.value ? new Date(newTaskDeadline.value + 'T00:00:00').toISOString() : null,
    dependencyIds: bagliGorevler.value.map(id => Number(id)),
    labelIds: selectedLabels.value,
  }

  $fetch('/api/tasks', {
    method: 'POST',
    body: payload,
    credentials: 'include',
  })
      .then(() => {
        toast.success('🎉 Görev başarıyla oluşturuldu!')
        taskStore.triggerRefresh()
        emit('add-task')
        // form temizle
        newTaskTitle.value = ''
        newTaskDesc.value = ''
        newTaskDeadline.value = ''
        bagliGorevler.value = []
        selectedLabels.value = []
      })
      .catch(err => {
        console.error('Görev eklenemedi:', err)
        toast.error('❌ Görev eklenirken bir hata oluştu.')
      })
}

/** Helpers - Bulk */
function normalizeItem(raw: any, idx: number) {
  const errors: string[] = []
  const item: any = {}

  // Zorunlu alanlar
  if (!raw || typeof raw !== 'object') {
    errors.push(`[${idx}] Geçersiz öğe (object olmalı).`)
    return { item: null, errors }
  }

  if (!raw.title || String(raw.title).trim().length === 0) {
    errors.push(`[${idx}] "title" zorunlu.`)
  } else {
    item.title = String(raw.title).trim()
  }

  if (raw.assignedTo === undefined || raw.assignedTo === null || isNaN(Number(raw.assignedTo))) {
    errors.push(`[${idx}] "assignedTo" zorunlu ve sayı olmalı.`)
  } else {
    item.assignedTo = Number(raw.assignedTo)
  }

  if (raw.project === undefined || raw.project === null || isNaN(Number(raw.project))) {
    errors.push(`[${idx}] "project" zorunlu ve sayı olmalı.`)
  } else {
    item.project = Number(raw.project)
  }

  // Opsiyoneller
  item.description = raw.description ? String(raw.description) : ''
  item.type = raw.type ? String(raw.type).toLowerCase() : 'task'
  item.level = raw.level ? String(raw.level).toLowerCase() : 'normal'

  if (raw.deadline) {
    // YYYY-MM-DD bekliyoruz
    const d = String(raw.deadline)
    const isValid = /^\d{4}-\d{2}-\d{2}$/.test(d)
    if (!isValid) {
      errors.push(`[${idx}] "deadline" YYYY-MM-DD formatında olmalı.`)
      item.deadline = null
    } else {
      item.deadline = new Date(d + 'T00:00:00').toISOString()
    }
  } else {
    item.deadline = null
  }

  item.dependencyIds = Array.isArray(raw.dependencyIds) ? raw.dependencyIds.map((n: any) => Number(n)).filter((n: any) => !isNaN(n)) : []
  item.labelIds = Array.isArray(raw.labelIds) ? raw.labelIds.map((n: any) => Number(n)).filter((n: any) => !isNaN(n)) : []

  return { item, errors }
}

function pasteTemplate() {
  bulkJson.value = JSON.stringify([
    {
      "title": "Landing sayfası hero düzeni",
      "assignedTo": 2,
      "project": 1,
      "type": "task",
      "level": "priority",
      "deadline": "2025-08-31",
      "dependencyIds": [101, 102],
      "labelIds": [5, 7],
      "description": "Yeni görseller ile hero alanı."
    },
    {
      "title": "Ödeme akışında 500 hatası",
      "assignedTo": 3,
      "project": 1,
      "type": "bug",
      "level": "critical",
      "deadline": "2025-08-25",
      "labelIds": [9],
      "description": "Checkout POST /pay sırasında 500."
    }
  ], null, 2)
}

/** Submit - Bulk */
async function submitBulk() {
  bulkErrors.value = []
  bulkSummary.value = ''

  if (!bulkJson.value.trim()) {
    bulkErrors.value.push('JSON alanı boş olamaz.')
    return
  }

  let body: any
  try {
    body = JSON.parse(bulkJson.value)     // textarea -> JS
  } catch (e: any) {
    bulkErrors.value.push('JSON parse hatası: ' + e.message)
    return
  }

  if (!Array.isArray(body)) {             // backend dizi bekliyor
    bulkErrors.value.push('Kök öğe bir dizi olmalı: [ {...}, {...} ]')
    return
  }

  isBulkSubmitting.value = true

  console.log(JSON.parse(bulkJson.value))


  try {
    await $fetch('/api/tasks/bulk', {
      method: 'POST',
      body: JSON.parse(bulkJson.value),
      credentials: 'include',
    })
    toast.success(`🎉 ${body.length} görev oluşturuldu!`)
    taskStore.triggerRefresh()
    bulkSummary.value = `${body.length} kayıt gönderildi.`
    bulkJson.value = ''
  } catch (err: any) {
    console.error('Toplu oluşturma hatası:', err)
    toast.error('❌ Toplu görev oluşturma sırasında hata oluştu.')
    bulkErrors.value.push('Sunucu hatası veya doğrulama reddi.')
  } finally {
    isBulkSubmitting.value = false
  }
}
</script>
