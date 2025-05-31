<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Üst Navbar -->
    <div class="bg-white w-full h-16 flex items-center px-8 mb-6 shadow">
      <Navbar />
    </div>

    <!-- 1:3:2 oranında grid -->
    <div class="grid px-8 gap-6" style="height: calc(100vh - 7rem); grid-template-columns: 1fr 3fr 2fr;">
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
          :projects="projects"
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

<script setup>
import { ref, computed } from 'vue';
import NotificationsPanel from './components/dashboard/notificationsPanel.vue';
import TaskListPanel from './components/dashboard/taskListPanel.vue';
import TaskCreatePanel from './components/dashboard/taskCreatePanel.vue';
import CommentListPanel from './components/dashboard/commentListPanel.vue';
import Navbar from './components/bar/Navbar.vue';

const selectedProject = ref('');
const assignedUser = ref('');
const userSearch = ref('');
const newTaskDeadline = ref('');
const newTaskType = ref('gorev');
const newTaskLevel = ref('normal');
const bagliGorev = ref('');
const newTaskTitle = ref('');
const newTaskDesc = ref('');
const taskFilter = ref('devam');

const projects = ref([
  { id: 1, name: 'CycleUp Platformu', description: 'Geri dönüşüm platformu', createdAt: '2024-11-01', status: 'active' },
  { id: 2, name: 'Mobil App Projesi', description: 'Mobil uygulama', createdAt: '2024-12-10', status: 'maintenance' },
  { id: 3, name: 'Web Dashboard', description: 'Yönetici paneli', createdAt: '2025-01-15', status: 'archived' }
]);

const users = ref([
  { id: 1, name: 'Ali Yılmaz' }, { id: 2, name: 'Zeynep Demir' }, { id: 3, name: 'Mehmet Çelik' },
  { id: 4, name: 'Caner Aydın' }, { id: 5, name: 'Elif Kaya' }, { id: 6, name: 'Serkan Koç' },
  { id: 7, name: 'Merve Yıldız' }, { id: 8, name: 'Burak Şahin' }, { id: 9, name: 'Tuba Aslan' }
]);

const usersByProject = ref([
  { id: 1, users: [{ userId: 1, role: 'developer' }, { userId: 2, role: 'tester' }, { userId: 3, role: 'leader' }] },
  { id: 2, users: [{ userId: 4, role: 'developer' }, { userId: 5, role: 'tester' }, { userId: 6, role: 'leader' }] },
  { id: 3, users: [{ userId: 7, role: 'developer' }, { userId: 8, role: 'tester' }, { userId: 9, role: 'leader' }] }
]);

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

const tasks = ref([
  { id: 1, projectId: 1, gorevKodu: 'GOREV-1001', title: 'API dokümantasyonu güncelle', status: 'Hazır', type: 'gorev', seviye: 'normal', time: 'Bugün 12:30', deadline: '2025-06-05' },
  { id: 2, projectId: 1, gorevKodu: 'GOREV-1002', title: 'Kullanıcı testi', status: 'Tamamlandı', type: 'gorev', seviye: 'öncelikli', time: 'Dün 17:10' },
  { id: 3, projectId: 2, gorevKodu: 'GOREV-1003', title: 'Login bug fix', status: 'Devam', type: 'hata', seviye: 'kritik', time: 'Bugün 09:45' },
  { id: 4, projectId: 1, gorevKodu: 'GOREV-1004', title: 'Yeni modül tasarımı', status: 'Beklemede', type: 'gorev', seviye: 'adimadim', bagliGorev: 2, bagliGorevTitle: 'Kullanıcı testi', time: 'Bugün 08:20', deadline: '2025-06-10' },
  { id: 5, projectId: 3, gorevKodu: 'GOREV-1005', title: 'Sunucu bakımı', status: 'Hazır', type: 'hata', seviye: 'normal', time: 'Dün 16:00' },
  { id: 6, projectId: 2, gorevKodu: 'GOREV-1006', title: 'Veritabanı performans analizi', status: 'Devam', type: 'gorev', seviye: 'öncelikli', time: 'Bugün 11:15', deadline: '2025-06-08' }
]);

const filteredTasks = computed(() =>
    taskFilter.value === 'devam'
        ? tasks.value.filter(t => t.status === 'Devam' || t.status === 'Beklemede')
        : taskFilter.value === 'hazir'
            ? tasks.value.filter(t => t.status === 'Hazır')
            : tasks.value
);

const tumGorevlerSecim = computed(() =>
    tasks.value.filter(t => t.type === 'gorev' && t.status !== 'Tamamlandı')
);

const comments = ref([
  { id: 1, author: 'Ahmet', text: 'Yeni görevleri gördüm, eline sağlık!', time: '5 dk önce' },
  { id: 2, author: 'Merve', text: 'Bildirimler çok iyi çalışıyor.', time: '1 saat önce' }
]);

const notifications = ref([
  { id: 1, type: 'gorev', kisi: 'Ahmet', gorevKodu: 'GOREV-1001', time: '3 dk önce' },
  { id: 2, type: 'yorum', kisi: 'Merve', gorevKodu: 'GOREV-1003', time: '1 saat önce' }
]);

function addTask() {
  if (
      newTaskTitle.value.trim() &&
      selectedProject.value &&
      assignedUser.value &&
      (newTaskType.value !== 'gorev' || newTaskLevel.value !== 'adimadim' || bagliGorev.value)
  ) {
    const gorevKodu = `GOREV-${Math.floor(1000 + Math.random() * 9000)}`;
    const bagli = tasks.value.find(t => t.id === +bagliGorev.value);
    const newTask = {
      id: Date.now(),
      projectId: selectedProject.value,
      gorevKodu,
      title: newTaskTitle.value,
      status: 'Devam',
      type: newTaskType.value,
      seviye: newTaskLevel.value,
      bagliGorev: newTaskLevel.value === 'adimadim' ? +bagliGorev.value : null,
      bagliGorevTitle: bagli?.title || '',
      deadline: newTaskDeadline.value || '',
      time: 'Şimdi'
    };
    tasks.value.unshift(newTask);
    notifications.value.unshift({ id: Date.now(), type: 'gorev', gorevKodu, time: 'Şimdi' });

    newTaskTitle.value = '';
    newTaskDesc.value = '';
    selectedProject.value = '';
    assignedUser.value = '';
    newTaskType.value = 'gorev';
    newTaskLevel.value = 'normal';
    bagliGorev.value = '';
    userSearch.value = '';
    newTaskDeadline.value = '';
  }
}
</script>
