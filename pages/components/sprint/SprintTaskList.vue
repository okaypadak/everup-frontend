<template>
  <div class="space-y-2">
    <div
        v-for="task in sprintTasks"
        :key="task.id"
        class="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm flex justify-between items-center"
    >
      <span class="text-black font-medium">{{ task.title }}</span>
      <span class="text-sm text-black italic">Durum: {{ task.status }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sprintId: { type: String, required: true }
})

// Örnek görev verisi (gerçekte API'den gelir)
const allTasks = [
  { id: 't1', title: 'API dokümantasyonunu yaz', status: 'hazır', sprintId: '1' },
  { id: 't2', title: 'Login bug fix', status: 'devam', sprintId: '2' },
  { id: 't3', title: 'Kullanıcı test senaryosu oluştur', status: 'tamamlandı', sprintId: '1' }
]

const sprintTasks = computed(() =>
    allTasks.filter(task => task.sprintId === props.sprintId)
)
</script>
