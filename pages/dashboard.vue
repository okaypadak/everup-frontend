<template>


  <div class="bg-gray-50 min-h-screen">

    <Navbar />

    <!-- 1:3:2 oranında grid -->
    <div class="grid px-8 gap-6 py-6" style="height: calc(100vh - 4rem); grid-template-columns: 1fr 3fr 2fr; ">
      <!-- Bildirimler + Yorumlar -->
      <div class="bg-white rounded-xl shadow h-full flex flex-col overflow-hidden">
        <div class="flex-1 min-h-0 flex flex-col">
          <div class="overflow-y-auto flex-1 min-h-0">
            <NotificationsPanel :notifications="notifications" />
          </div>
        </div>
        <div class="flex-1 min-h-0 flex flex-col mt-4">
          <div class="overflow-y-auto flex-1 min-h-0">
            <CommentListPanel :comments="comments" />
          </div>
        </div>
      </div>

      <!-- Görev Listesi -->
      <TaskListPanel
          :filteredTasks="filteredTasks"
          :taskFilter="taskFilter"
          @update:taskFilter="taskFilter = $event"
      />

      <!-- Görev Oluştur -->
      <TaskCreatePanel
          :projects="projects"
          :filteredUsers="filteredUsers"
          :tumGorevlerSecim="tumGorevlerSecim"
          :selectedProject="selectedProject"
          :assignedUser="assignedUser"
          :userSearch="userSearch"
          :newTaskType="newTaskType"
          :newTaskLevel="newTaskLevel"
          :bagliGorev="bagliGorev"
          :newTaskTitle="newTaskTitle"
          :newTaskDesc="newTaskDesc"
          :newTaskDeadline="newTaskDeadline"
          @update:selectedProject="selectedProject = $event"
          @update:assignedUser="assignedUser = $event"
          @update:userSearch="userSearch = $event"
          @update:newTaskType="newTaskType = $event"
          @update:newTaskLevel="newTaskLevel = $event"
          @update:bagliGorev="bagliGorev = $event"
          @update:newTaskTitle="newTaskTitle = $event"
          @update:newTaskDesc="newTaskDesc = $event"
          @update:newTaskDeadline="newTaskDeadline = $event"
          @add-task="addTask"
          class="flex flex-col h-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFetch } from '#app'
import NotificationsPanel from './components/dashboard/notificationsPanel.vue'
import TaskListPanel from './components/dashboard/taskListPanel.vue'
import TaskCreatePanel from './components/dashboard/taskCreatePanel.vue'
import CommentListPanel from './components/dashboard/commentListPanel.vue'
import Navbar from './components/bar/Navbar.vue'

const selectedProject = ref('')
const assignedUser = ref('')
const userSearch = ref('')
const newTaskDeadline = ref('')
const newTaskType = ref('gorev')
const newTaskLevel = ref('normal')
const bagliGorev = ref('')
const newTaskTitle = ref('')
const newTaskDesc = ref('')
const taskFilter = ref('devam')

const projects = ref([
  { id: 1, name: 'CycleUp Platformu', description: 'Geri dönüşüm platformu', createdAt: '2024-11-01', status: 'active' },
  { id: 2, name: 'Mobil App Projesi', description: 'Mobil uygulama', createdAt: '2024-12-10', status: 'maintenance' },
  { id: 3, name: 'Web Dashboard', description: 'Yönetici paneli', createdAt: '2025-01-15', status: 'archived' }
]);

const usersByProject = ref([
  { id: 1, users: [{ userId: 1, role: 'developer' }, { userId: 2, role: 'tester' }, { userId: 3, role: 'leader' }] },
  { id: 2, users: [{ userId: 4, role: 'developer' }, { userId: 5, role: 'tester' }, { userId: 6, role: 'leader' }] },
  { id: 3, users: [{ userId: 7, role: 'developer' }, { userId: 8, role: 'tester' }, { userId: 9, role: 'leader' }] }
]);

const users = ref([
  { id: 1, name: 'Ali Yılmaz' }, { id: 2, name: 'Zeynep Demir' }, { id: 3, name: 'Mehmet Çelik' },
  { id: 4, name: 'Caner Aydın' }, { id: 5, name: 'Elif Kaya' }, { id: 6, name: 'Serkan Koç' },
  { id: 7, name: 'Merve Yıldız' }, { id: 8, name: 'Burak Şahin' }, { id: 9, name: 'Tuba Aslan' }
]);



// --- TASK INTERFACE ---
interface Task {
  id: number | string
  projectId?: number | string
  title: string
  description?: string
  status: string // "Ready" | "In Progress" | "Waiting" | "Completed" | "Hazır" | "Devam" | "Beklemede" | "Tamamlandı"
  type: string   // "task" | "gorev" | "test" | "hata" | ...
  level?: string // "normal" | "kritik" | "acil" | "öncelikli" | ...
  createdAt?: string
  deadline?: string | null
  dependentTaskId?: number | string | null
  dependentTaskTitle?: string
  gorevKodu?: string
  time?: string
  bagliGorev?: number | string | null
  bagliGorevTitle?: string
}

// --- TASKS STATE VE FETCH ---
const tasks = ref<Task[]>([])
const isLoadingTasks = ref(true)
const token = useState<string>('user')

async function fetchTasks() {
  isLoadingTasks.value = true
  try {
    const data = await $fetch<Task[]>('/api/tasks', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    tasks.value = data.map(task => ({
      ...task,
      gorevKodu: task.gorevKodu || `GOREV-${task.id}`,
      time: task.createdAt ? new Date(task.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '',
      bagliGorev: task.dependentTaskId || null,
      bagliGorevTitle: task.dependentTaskTitle || ''
    }))
  } catch (error) {
    console.error('Görevler çekilemedi', error)
    tasks.value = []
  }
  isLoadingTasks.value = false
}

onMounted(fetchTasks)

const filteredTasks = computed(() =>
    taskFilter.value === 'devam'
        ? tasks.value.filter(
            t =>
                t.status === 'In Progress' ||
                t.status === 'Waiting' ||
                t.status === 'Devam' ||
                t.status === 'Beklemede'
        )
        : taskFilter.value === 'hazir'
            ? tasks.value.filter(
                t => t.status === 'Ready' || t.status === 'Hazır'
            )
            : tasks.value
)

const tumGorevlerSecim = computed(() =>
    tasks.value.filter(
        t => t.type === 'gorev' && t.status !== 'Tamamlandı' && t.status !== 'Completed'
    )
)

// --- STATIK DIĞER STATE'LER ---
const comments = ref([
  { id: 1, author: 'Ahmet', text: 'Yeni görevleri gördüm, eline sağlık!', time: '5 dk önce' },
  { id: 2, author: 'Merve', text: 'Bildirimler çok iyi çalışıyor.', time: '1 saat önce' }
])

const notifications = ref([
  { id: 1, type: 'gorev', kisi: 'Ahmet', gorevKodu: 'GOREV-1001', time: '3 dk önce' },
  { id: 2, type: 'yorum', kisi: 'Merve', gorevKodu: 'GOREV-1003', time: '1 saat önce' }
])

const assignableRolesByTaskType = {
  gorev: ['developer', 'leader'],
  test: ['tester'],
  hata: ['developer', 'tester'],
  onay: ['leader']
};

const filteredUsers = computed(() => {
  const proj = usersByProject.value.find(p => p.id === +selectedProject.value);
  const roles = assignableRolesByTaskType[newTaskType.value] || [];
  if (!proj) return [];
  const filtered = proj.users
      .filter(u => roles.includes(u.role))
      .map(u => users.value.find(x => x.id === u.userId))
      .filter(Boolean);
  if (!userSearch.value.trim()) return filtered;
  return filtered.filter(u => u.name.toLowerCase().includes(userSearch.value.toLowerCase()));
});

// --- TASK EKLEME (mock, istersen API POST ile de ekleyebilirsin) ---
function addTask() {
  if (
      newTaskTitle.value.trim() &&
      selectedProject.value &&
      assignedUser.value
  ) {
    const gorevKodu = `GOREV-${Math.floor(1000 + Math.random() * 9000)}`
    const bagli = tasks.value.find(t => t.id === +bagliGorev.value)
    const newTask: Task = {
      id: Date.now(),
      projectId: selectedProject.value,
      gorevKodu,
      title: newTaskTitle.value,
      status: 'Devam',
      type: newTaskType.value,
      level: newTaskLevel.value,
      bagliGorev: bagliGorev.value ? +bagliGorev.value : null,
      bagliGorevTitle: bagli?.title || '',
      deadline: newTaskDeadline.value || '',
      time: 'Şimdi'
    }
    tasks.value.unshift(newTask)
    notifications.value.unshift({ id: Date.now(), type: 'gorev', gorevKodu, time: 'Şimdi' })

    newTaskTitle.value = ''
    newTaskDesc.value = ''
    selectedProject.value = ''
    assignedUser.value = ''
    newTaskType.value = 'gorev'
    newTaskLevel.value = 'normal'
    bagliGorev.value = ''
    userSearch.value = ''
    newTaskDeadline.value = ''
  }
}
</script>
c