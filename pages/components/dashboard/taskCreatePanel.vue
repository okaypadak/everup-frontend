<template>
  <div class="bg-white rounded-xl p-4 shadow flex flex-col gap-4 h-full overflow-y-auto min-h-0">
    <!-- Başlık: Yeni Görev/Hata -->
    <div class="flex items-center gap-2 mb-2 text-xl font-bold text-gray-700">
      <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h8m-8 5h16" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Yeni Görev/Hata Oluştur
      <svg v-if="newTaskType === 'hata'" class="w-6 h-6 text-red-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <!-- Basit bir bug/bug/hatayı simgeleyen SVG -->
        <circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
      </svg>
      <svg v-else class="w-6 h-6 text-green-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <!-- Kalem veya görev için başka ikon -->
        <path d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>
    <!-- Form Alanı (Aynı senin kodun, scroll'da kalacak) -->
    <label class="block">
      <span class="block text-gray-700 text-base font-semibold mb-1 flex items-center gap-1">
        Proje Seç
      </span>
      <select
          :value="selectedProject"
          @change="onSelectProject"
          class="block w-full mt-1 rounded-md border border-gray-300 bg-gray-100 text-gray-700 shadow-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 px-3 py-2"
      >
        <option value="">Proje seçiniz</option>
        <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </label>

    <!-- Tür seçimi -->
    <label class="block">
      <span class="block text-gray-700 text-base font-semibold mb-1">Tür</span>
      <select
          :value="newTaskType"
          @change="onTaskType"
          class="block w-full mt-1 rounded-md border-gray-300 bg-gray-50 text-gray-700 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-200 px-3 py-2"
      >
        <option value="">Tür Seçiniz</option>
        <option value="gorev">Görev</option>
        <option value="hata">Hata</option>
        <option value="test">Test</option>
        <option value="onay">Onay</option>

      </select>
    </label>

    <!-- Kişi arama ve seçim -->
    <label class="block">
      <input
          :value="userSearch"
          @input="onUserSearch"
          class="mb-2 w-full rounded px-2 py-1 border border-gray-300 focus:ring-2 focus:ring-blue-200"
          placeholder="Kişi ara..."
          autocomplete="off"
          type="text"
      />
      <span class="block text-gray-700 text-base font-semibold mb-1">Atanacak Kişi</span>
      <select
          :value="assignedUser"
          @change="onAssignedUser"
          class="block w-full mt-1 rounded-md border-gray-300 bg-gray-50 text-gray-700 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-200 px-3 py-2"
      >
        <option value="" disabled>Kişi seçiniz</option>
        <option v-for="user in filteredUsers" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
    </label>

    <!-- Seviye seçimi -->
    <label class="block">
      <span class="block text-gray-700 text-base font-semibold mb-1">Seviye</span>
      <select
          :value="newTaskLevel"
          @change="onTaskLevel"
          class="block w-full mt-1 rounded-md border-gray-300 bg-gray-50 text-gray-700 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-200 px-3 py-2"
      >
        <template v-if="newTaskType === 'gorev'">
          <option value="normal">Normal</option>
          <option value="oncelikli">Öncelikli</option>
        </template>
        <template v-else>
          <option value="normal">Normal</option>
          <option value="acil">Acil</option>
          <option value="kritik">Kritik</option>
        </template>
      </select>
    </label>
    <!-- Bağlanacak görev seçimi sadece adım adımda göster -->
    <label v-if="newTaskType === 'gorev'" class="block">
      <span class="block text-gray-700 text-base font-semibold mb-1">Bağlanacak Görev</span>
      <select
          :value="bagliGorev"
          @change="onBagliGorev"
          class="block w-full mt-1 rounded-md border-gray-300 bg-gray-50 text-gray-700 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-200 px-3 py-2"
      >
        <option value="">Bağımsız</option>
        <option v-for="g in tumGorevlerSecim" :key="g.id" :value="g.id">{{ g.title }}</option>
      </select>
    </label>
    <!-- Bitiş Tarihi (Opsiyonel) -->
    <label class="block">
      <span class="block text-gray-700 text-base font-semibold mb-1">Bitiş Tarihi</span>
      <input
          :value="newTaskDeadline"
          @input="onTaskDeadline"
          type="date"
          class="rounded-md bg-gray-100 px-3 py-2 font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Tarih seçiniz"
      />
    </label>
    <input
        :value="newTaskTitle"
        @input="onTaskTitle"
        placeholder="Yeni görev başlığı"
        class="rounded-md bg-gray-100 px-3 py-2 font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
    <textarea
        :value="newTaskDesc"
        @input="onTaskDesc"
        rows="10"
        placeholder="Açıklama"
        class="rounded-md bg-gray-100 px-3 py-2 resize-none border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
    ></textarea>
    <button
        @click="addTaskLocal"
        :disabled="!newTaskTitle || !selectedProject || !assignedUser || (newTaskType==='gorev' && !bagliGorev)"
        :class="[
        'inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500 hover:shadow-lg transition-all text-white font-bold py-2 px-6 rounded-xl shadow-md active:scale-95',
        (!newTaskTitle || !selectedProject || !assignedUser || (newTaskType==='gorev' && !bagliGorev)) && 'opacity-50 cursor-not-allowed'
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
interface Project { id: number | string; name: string }
interface User { id: number | string; name: string }
interface Task { id: number | string; title: string }


defineProps<{
  projects: Project[]
  filteredUsers: User[]
  tumGorevlerSecim: Task[]
  selectedProject: string | number
  assignedUser: string | number
  userSearch: string
  newTaskType: string
  newTaskLevel: string
  bagliGorev: string | number
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
  (e: 'update:bagliGorev', value: string | number): void
  (e: 'update:newTaskTitle', value: string): void
  (e: 'update:newTaskDesc', value: string): void
  (e: 'update:newTaskDeadline', value: string): void
  (e: 'add-task'): void
}>()

function onSelectProject(e: Event) {
  emit('update:selectedProject', (e.target as HTMLSelectElement).value)
}
function onAssignedUser(e: Event) {
  emit('update:assignedUser', (e.target as HTMLSelectElement).value)
}
function onUserSearch(e: Event) {
  emit('update:userSearch', (e.target as HTMLInputElement).value)
}
function onTaskType(e: Event) {
  emit('update:newTaskType', (e.target as HTMLSelectElement).value)
}
function onTaskLevel(e: Event) {
  emit('update:newTaskLevel', (e.target as HTMLSelectElement).value)
}
function onBagliGorev(e: Event) {
  emit('update:bagliGorev', (e.target as HTMLSelectElement).value)
}
function onTaskTitle(e: Event) {
  emit('update:newTaskTitle', (e.target as HTMLInputElement).value)
}
function onTaskDesc(e: Event) {
  emit('update:newTaskDesc', (e.target as HTMLTextAreaElement).value)
}
function onTaskDeadline(e: Event) {
  emit('update:newTaskDeadline', (e.target as HTMLInputElement).value)
}
function addTaskLocal() {
  emit('add-task')
}
</script>
