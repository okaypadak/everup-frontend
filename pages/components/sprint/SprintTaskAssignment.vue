<template>
  <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
    <!-- Sprint Seç -->
    <div>
      <label class="block text-sm font-medium text-black mb-1">Sprint Seç</label>
      <select
          v-model="selectedSprintId"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
          @change="emitSprint"
      >
        <option disabled value="">Bir sprint seçin</option>
        <option v-for="s in sprints" :key="s.id" :value="s.id">
          {{ s.name }}
        </option>
      </select>
    </div>

    <!-- Görev Seçimi -->
    <div>
      <label class="block text-sm font-medium text-black mb-2">Görevler (hazır durumdakiler)</label>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2"
        >
          <input
              v-model="selectedTaskIds"
              type="checkbox"
              :value="task.id"
              class="accent-sky-600 w-4 h-4 text-black"
          >
          <span class="text-black">{{ task.title }}</span>
        </div>
      </div>
    </div>

    <!-- Atama Butonu -->
    <div class="text-right">
      <button
          class="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
          :disabled="!selectedSprintId || selectedTaskIds.length === 0"
          @click="assignTasks"
      >
        Seçilen Görevleri Ata
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
const emit = defineEmits(['sprint-selected'])

// Demo veriler (gerçekte API'den gelir)
const sprints = ref([
  { id: '1', name: 'Sprint 13 - Mayıs' },
  { id: '2', name: 'Sprint 14 - Haziran' }
])

const tasks = ref([
  { id: 't1', title: 'API dokümantasyonunu yaz', status: 'hazır' },
  { id: 't2', title: 'Login bug fix', status: 'devam' },
  { id: 't3', title: 'Kullanıcı test senaryosu oluştur', status: 'hazır' }
])

const selectedSprintId = ref('')
const selectedTaskIds = ref([])

const filteredTasks = computed(() => tasks.value.filter(t => t.status === 'hazır'))

const emitSprint = () => {
  const sprint = sprints.value.find(s => s.id === selectedSprintId.value)
  if (sprint) emit('sprint-selected', sprint)
}

const assignTasks = () => {
  toast.success('Görevler başarıyla sprint\'e atandı!')
  selectedTaskIds.value = []
}
</script>
