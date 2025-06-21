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
          :value="props.selectedProject"
          @change="onSelectProject"
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
          :value="props.newTaskType"
          @change="onTaskType"
          class="block w-full mt-1 rounded-md border-gray-300 bg-gray-50 text-gray-700 shadow-sm px-3 py-2"
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
          :value="props.userSearch"
          @input="onUserSearch"
          class="mb-2 w-full rounded px-2 py-1 border border-gray-300 focus:ring-2 focus:ring-blue-200"
          placeholder="Kişi ara..."
          autocomplete="off"
          type="text"
      />
      <span class="block text-gray-700 text-base font-semibold mb-1">Atanacak Kişi</span>
      <select
          :value="props.assignedUser"
          @change="onAssignedUser"
          class="block w-full mt-1 rounded-md border-gray-300 bg-gray-50 text-gray-700 shadow-sm px-3 py-2"
      >
        <option value="" disabled>Kişi seçiniz</option>
        <option v-for="user in filteredUsers" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
    </label>

    <!-- Seviye -->
    <label class="block">
      <span class="block text-gray-700 text-base font-semibold mb-1">Seviye</span>
      <select
          :value="props.newTaskLevel"
          @change="onTaskLevel"
          class="block w-full mt-1 rounded-md border-gray-300 bg-gray-50 text-gray-700 shadow-sm px-3 py-2"
      >
        <template v-if="props.newTaskType === 'task'">
          <option value="normal">Normal</option>
          <option value="priority">Öncelikli</option>
        </template>
        <template v-else>
          <option value="normal">Normal</option>
          <option value="critical">Kritik</option>
        </template>
      </select>
    </label>

    <!-- Çoklu Bağlı Görev -->
    <label v-if="props.newTaskType === 'task'" class="block">
      <span class="block text-gray-700 text-base font-semibold mb-1">Bağlı Görevler</span>
      <select
          multiple
          :value="props.bagliGorevler"
          @change="onBagliGorevler"
          class="block w-full mt-1 rounded-md border-gray-300 bg-gray-50 text-gray-700 shadow-sm px-3 py-2 h-32"
      >
        <option v-for="g in tumGorevler" :key="g.id" :value="g.id">{{ g.title }}</option>
      </select>
    </label>

    <!-- Deadline -->
    <label class="block">
      <span class="block text-gray-700 text-base font-semibold mb-1">Bitiş Tarihi</span>
      <input
          :value="props.newTaskDeadline"
          @input="onTaskDeadline"
          type="date"
          class="rounded-md bg-gray-100 px-3 py-2 font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </label>

    <!-- Başlık -->
    <input
        :value="props.newTaskTitle"
        @input="onTaskTitle"
        placeholder="Yeni görev başlığı"
        class="rounded-md bg-gray-100 px-3 py-2 font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
    />

    <!-- Açıklama -->
    <textarea
        :value="props.newTaskDesc"
        @input="onTaskDesc"
        rows="10"
        placeholder="Açıklama"
        class="rounded-md bg-gray-100 px-3 py-2 resize-none border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
    ></textarea>

    <!-- Görev Oluştur Butonu -->
    <button
        @click="addTaskLocal"
        :disabled="isDisabled"
        :class="[
        'inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold py-2 px-6 rounded-xl shadow-md active:scale-95 transition-all duration-150',
        isDisabled ? 'opacity-50' : 'hover:from-blue-500 hover:to-green-500 hover:shadow-lg'
      ]"
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

interface Project { id: number; name: string }
interface User { id: number; name: string }
interface Task { id: number | string; title: string }

const props = defineProps<{
  tumGorevlerSecim: Task[]
  selectedProject: string | number
  assignedUser: string | number
  userSearch: string
  newTaskType: string
  newTaskLevel: string
  bagliGorevler: number[]
  newTaskTitle: string
  newTaskDesc: string
  newTaskDeadline: string
}>()


const emit = defineEmits<{
  (e: 'update:selectedProject', value: string | number): void
  (e: 'update:assignedUser', value: string | number): void
  (e: 'update:userSearch', value: string): void
  (e: 'update:newTaskType', value: string): void
  (e: 'update:newTaskLevel', value: string): void
  (e: 'update:bagliGorevler', value: (string | number)[]): void
  (e: 'update:newTaskTitle', value: string): void
  (e: 'update:newTaskDesc', value: string): void
  (e: 'update:newTaskDeadline', value: string): void
  (e: 'add-task'): void
}>()

const projects = ref<Project[]>([])
const allUsers = ref<User[]>([])
const tumGorevler = ref<Task[]>([])

const isDisabled = computed(() =>
    !props.newTaskTitle || !props.selectedProject || !props.assignedUser
)

onMounted(async () => {
  try {
    const data = await $fetch<Project[]>('/api/projects')
    projects.value = data
  } catch (err) {
    console.error('Projeler yüklenemedi:', err)
  }
})

watch(() => props.selectedProject, async (newId) => {
  if (!newId) return

  try {
    const projectUsers = await $fetch<{ id: number; members: any[] }>(`/api/projects/${newId}/users`)
    allUsers.value = projectUsers.members.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))
  } catch (err) {
    console.error('Kullanıcılar yüklenemedi:', err)
  }

  try {
    const taskList = await $fetch<Task[]>(`/api/tasks/project/${newId}`)
    tumGorevler.value = taskList
  } catch (err) {
    console.error('Görevler yüklenemedi:', err)
  }
})

const filteredUsers = computed(() => {
  if (!props.userSearch) return allUsers.value
  return allUsers.value.filter(u =>
      u.name.toLowerCase().includes(props.userSearch.toLowerCase())
  )
})

function onSelectProject(e: Event) { emit('update:selectedProject', (e.target as HTMLSelectElement).value) }
function onAssignedUser(e: Event) { emit('update:assignedUser', (e.target as HTMLSelectElement).value) }
function onUserSearch(e: Event) { emit('update:userSearch', (e.target as HTMLInputElement).value) }
function onTaskType(e: Event) { emit('update:newTaskType', (e.target as HTMLSelectElement).value) }
function onTaskLevel(e: Event) { emit('update:newTaskLevel', (e.target as HTMLSelectElement).value) }
function onBagliGorevler(e: Event) {
  const selected = Array.from((e.target as HTMLSelectElement).selectedOptions).map(opt => Number(opt.value))
  console.log('Seçilen görevler:', selected)
  emit('update:bagliGorevler', selected)
}
function onTaskTitle(e: Event) { emit('update:newTaskTitle', (e.target as HTMLInputElement).value) }
function onTaskDesc(e: Event) { emit('update:newTaskDesc', (e.target as HTMLTextAreaElement).value) }
function onTaskDeadline(e: Event) { emit('update:newTaskDeadline', (e.target as HTMLInputElement).value) }

function addTaskLocal() {
  const payload = {
    title: props.newTaskTitle,
    description: props.newTaskDesc,
    assignedTo: Number(props.assignedUser),
    project: Number(props.selectedProject),
    type: props.newTaskType || 'TASK',
    level: props.newTaskLevel || 'NORMAL',
    deadline: props.newTaskDeadline
        ? new Date(props.newTaskDeadline).toISOString()
        : null,
    dependencyIds: props.bagliGorevler?.map(id => Number(id)),
  };

  console.log('📦 Payload:', payload);

  $fetch('/api/tasks', {
    method: 'POST',
    body: payload,
    credentials: 'include',
  })
      .then(() => {
        toast.success('🎉 Görev başarıyla oluşturuldu!');
        emit('add-task'); // üst bileşende fetchTasks tetiklemek için hâlâ kullanabilirsin
      })
      .catch(err => {
        console.error('Görev eklenemedi:', err);
        toast.error('❌ Görev eklenirken bir hata oluştu.');
      });

  toast.success('🎉 Görev başarıyla oluşturuldu!')
}

</script>
