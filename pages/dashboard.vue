<template>
  <div class="min-h-screen bg-gray-50">

    <div class="w-full bg-blue-300 h-16 flex items-center px-8 mb-6 shadow">
      <span class="text-xl font-bold text-white tracking-wide flex items-center gap-3">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M8 12h8M12 8v8" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
        CycleUp Dashboard
      </span>
    </div>

    <div class="flex flex-row gap-6 px-8" style="height: calc(100vh - 7rem);">

      <div class="flex flex-col w-1/5 bg-white rounded-xl p-4 shadow h-full">

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
      
      <TaskListPanel
          :filteredTasks="filteredTasks"
          :taskFilter="taskFilter"
          :projects="projects"
          @update:taskFilter="taskFilter = $event"
      />

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
          class="flex flex-col w-2/5 h-full flex-1"
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

const projects = ref([
  { id: 1, name: 'Web Platformu' },
  { id: 2, name: 'Mobil Uygulama' },
  { id: 3, name: 'Backend API' },
]);
const usersByProject = {
  1: [
    { id: 1, name: 'Ahmet' },
    { id: 2, name: 'Merve' },
    { id: 3, name: 'Zeynep' },
  ],
  2: [
    { id: 4, name: 'Emre' },
    { id: 5, name: 'Burcu' },
    { id: 2, name: 'Merve' },
  ],
  3: [
    { id: 6, name: 'Onur' },
    { id: 7, name: 'Tayfun' },
  ],
};

const selectedProject = ref('');
const assignedUser = ref('');
const userSearch = ref('');
const newTaskDeadline = ref('');

const filteredUsers = computed(() => {
  const users = usersByProject[selectedProject.value] || [];
  if (!userSearch.value.trim()) return users;
  return users.filter(u =>
      u.name.toLowerCase().includes(userSearch.value.trim().toLowerCase())
  );
});

const notifications = ref([
  { id: 1, type: 'gorev', gorevKodu: 'GOREV-1005', time: '3 dk önce' },
  { id: 2, type: 'yorum', kisi: 'Ahmet', gorevKodu: 'GOREV-1005', time: '5 dk önce' },
  { id: 3, type: 'yorum', kisi: 'Merve', gorevKodu: 'GOREV-1001', time: '1 saat önce' },
  { id: 4, type: 'gorev', gorevKodu: 'GOREV-1007', time: '2 saat önce' },
  { id: 5, type: 'yorum', kisi: 'Emre', gorevKodu: 'GOREV-1003', time: '2 saat önce' },
]);
const tasks = ref([
  { id: 1, projectId: 1, gorevKodu: 'GOREV-1005', title: 'API dokümantasyonu güncelle', status: 'Devam', type: 'gorev', seviye: 'normal', time: 'Bugün 12:30', deadline: '2025-06-05' },
  { id: 2, projectId: 1, gorevKodu: 'GOREV-1001', title: 'Kullanıcı testi', status: 'Tamamlandı', type: 'gorev', seviye: 'oncelikli', time: 'Dün 17:10', deadline: '' },
  { id: 3, projectId: 2, gorevKodu: 'GOREV-1003', title: 'Login bug fix', status: 'Devam', type: 'hata', seviye: 'kritik', time: 'Bugün 09:45', deadline: '' },
  { id: 4, projectId: 1, gorevKodu: 'GOREV-1007', title: 'Yeni modül tasarımı', status: 'Devam', type: 'gorev', seviye: 'adimadim', bagliGorev: 2, bagliGorevTitle: 'Kullanıcı testi', time: 'Bugün 08:20', deadline: '2025-06-10' },
  { id: 5, projectId: 3, gorevKodu: 'GOREV-1009', title: 'Sunucu bakımı', status: 'Tamamlandı', type: 'hata', seviye: 'normal', time: 'Dün 16:00', deadline: '' },
]);

const newTaskType = ref('gorev');
const newTaskLevel = ref('normal');
const bagliGorev = ref('');
const taskFilter = ref('devam');
const filteredTasks = computed(() => {
  if (taskFilter.value === 'devam') {
    return tasks.value.filter(t => t.status === 'Devam');
  }
  return tasks.value;
});
const tumGorevlerSecim = computed(() => {
  return tasks.value.filter(
      t => t.type === 'gorev' && t.status !== 'Tamamlandı'
  );
});
const comments = ref([
  { id: 1, author: 'Ahmet', text: 'Yeni görevleri gördüm, eline sağlık!', time: '5 dk önce' },
  { id: 2, author: 'Merve', text: 'Bildirimler çok iyi çalışıyor.', time: '1 saat önce' },
  { id: 3, author: 'Emre', text: 'Orta panelde scroll harika olmuş.', time: '2 saat önce' },
  { id: 4, author: 'Hülya', text: 'Kritik görevleri kırmızı badge ile işaretledim.', time: '3 saat önce' },
  { id: 5, author: 'Tayfun', text: 'Sürükle bırak özelliği de eklenebilir.', time: '3 saat önce' },
  { id: 6, author: 'Zeynep', text: 'Tasarım çok ferah olmuş.', time: '4 saat önce' },
  { id: 7, author: 'Onur', text: 'Mobile görünümünü test ettim, responsive iyi.', time: '4 saat önce' },
  { id: 8, author: 'Burcu', text: 'Hover efektleri çok hoş.', time: '5 saat önce' },
]);
const newTaskTitle = ref('');
const newTaskDesc = ref('');

function addTask() {
  if (
      newTaskTitle.value.trim() !== '' &&
      selectedProject.value &&
      assignedUser.value &&
      (newTaskType.value !== 'gorev' || newTaskLevel.value !== 'adimadim' || bagliGorev.value)
  ) {
    const yeniGorevKodu = `GOREV-${Math.floor(Math.random() * 9000) + 1000}`;
    let bagliTitle = '';
    if (newTaskType.value === 'gorev' && newTaskLevel.value === 'adimadim' && bagliGorev.value) {
      const g = tasks.value.find(t => t.id === +bagliGorev.value);
      bagliTitle = g ? g.title : '';
    }
    tasks.value.unshift({
      id: Date.now(),
      projectId: selectedProject.value,        // Proje id ekleniyor!
      gorevKodu: yeniGorevKodu,
      title: newTaskTitle.value,               // SADECE başlık!
      status: 'Devam',
      type: newTaskType.value,
      seviye: newTaskLevel.value,
      bagliGorev: (newTaskType.value === 'gorev' && newTaskLevel.value === 'adimadim') ? +bagliGorev.value : null,
      bagliGorevTitle: bagliTitle,
      deadline: newTaskDeadline.value || '',
      time: 'Şimdi',
    });
    notifications.value.unshift({
      id: Date.now(),
      type: 'gorev',
      gorevKodu: yeniGorevKodu,
      time: 'Şimdi'
    });
    // input temizliği
    newTaskTitle.value = '';
    newTaskDesc.value = '';
    selectedProject.value = '';
    assignedUser.value = '';
    newTaskLevel.value = 'normal';
    newTaskType.value = 'gorev';
    bagliGorev.value = '';
    userSearch.value = '';
    newTaskDeadline.value = '';
  }
}

</script>
