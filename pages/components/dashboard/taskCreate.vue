<template>
  <div class="bg-white rounded-xl p-4 shadow flex flex-col gap-4 h-full overflow-y-auto min-h-0">
    <div class="flex items-center gap-2 mb-2 text-xl font-bold text-gray-700">
      <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h8m-8 5h16" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Yeni Görev/Hata Oluştur
    </div>

    <!-- Proje Seç -->
    <label class="block">
      <span class="block text-gray-700 text-base font-semibold mb-1">Proje Seç</span>
      <select
          v-model="selectedProject"
          class="block w-full mt-1 rounded-md border border-gray-300 bg-gray-100 text-gray-700 shadow-sm px-3 py-2"
      >
        <option value="">Proje seçiniz</option>
        <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
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
          class="mb-2 w-full rounded px-2 py-1 border border-gray-300 focus:ring-2 focus:ring-blue-200"
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
        <option v-for="user in filteredUsers" :key="user.id" :value="user.id">{{ user.name }}</option>
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
          class="rounded-md bg-gray-100 px-3 py-2 font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
    </label>

    <!-- Başlık -->
    <input
        v-model="newTaskTitle"
        placeholder="Yeni görev başlığı"
        class="rounded-md bg-gray-100 px-3 py-2 font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
    >

    <!-- Açıklama -->
    <textarea
        v-model="newTaskDesc"
        rows="10"
        placeholder="Açıklama"
        class="rounded-md bg-gray-100 px-3 py-2 resize-none border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[300px]"
    />

    <!-- Görev Oluştur Butonu -->
    <button
        :disabled="isDisabled"
        :class="[
        'inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold py-2 px-6 rounded-xl shadow-md active:scale-95 transition-all duration-150',
        isDisabled ? 'opacity-50' : 'hover:from-blue-500 hover:to-green-500 hover:shadow-lg'
      ]"
        @click="addTaskLocal"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      Görev Oluştur
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { toast } from 'vue3-toastify'
const emit = defineEmits(['add-task'])

interface Project { id: number; name: string }
interface User { id: number; name: string }
interface Task { id: number | string; title: string; status: string; type: string; level: string; assignedTo: number; project: number; deadline: string | null; dependencyIds: number[]; labelIds: number[]; description: string; }
interface TaskLabel { id: number; name: string }

const selectedProject = ref('')
const assignedUser = ref('')
const userSearch = ref('')
const newTaskType = ref('task')
const newTaskLevel = ref('normal')
const newTaskTitle = ref('')
const newTaskDesc = ref('')
const newTaskDeadline = ref('')
const bagliGorevler = ref<(string | number)[]>([])
const selectedLabels = ref<number[]>([])

const projects = ref<Project[]>([])
const allUsers = ref<User[]>([])
const tumGorevler = ref<Task[]>([])
const projectLabels = ref<TaskLabel[]>([])

import { useTaskStore } from '@/stores/taskStore'
const taskStore = useTaskStore()

const isDisabled = computed(() => !newTaskTitle.value || !selectedProject.value || !assignedUser.value)

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

const filteredUsers = computed(() => {
  if (!userSearch.value) return allUsers.value
  return allUsers.value.filter(u =>
      u.name.toLowerCase().includes(userSearch.value.toLowerCase())
  )
})

function toggleLabel(labelId: number) {
  if (selectedLabels.value.includes(labelId)) {
    selectedLabels.value = selectedLabels.value.filter(id => id !== labelId)
  } else {
    selectedLabels.value.push(labelId)
  }
}

function addTaskLocal() {
  const payload = {
    title: newTaskTitle.value,
    description: newTaskDesc.value,
    assignedTo: Number(assignedUser.value),
    project: Number(selectedProject.value),
    type: newTaskType.value || 'TASK',
    level: newTaskLevel.value || 'NORMAL',
    deadline: newTaskDeadline.value ? new Date(newTaskDeadline.value).toISOString() : null,
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
      })
      .catch(err => {
        console.error('Görev eklenemedi:', err)
        toast.error('❌ Görev eklenirken bir hata oluştu.')
      })
}
</script>
