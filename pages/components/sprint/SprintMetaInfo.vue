<template>
  <div class="space-y-3">
    <!-- Sprint Başlık -->
    <div class="text-lg font-semibold text-sky-700">
      📌 {{ sprint.name }}
    </div>

    <!-- Tarihler -->
    <p class="text-sm text-black">
      <strong>Tarih:</strong> {{ formatDate(sprint.startDate) }} – {{ formatDate(sprint.endDate) }}
    </p>

    <!-- Kalan Gün -->
    <p class="text-sm text-black">
      <strong>Kalan Gün:</strong> {{ daysRemaining }} gün
    </p>

    <!-- Sprint Hedefi -->
    <div v-if="sprint.goal" class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-black text-sm">
      <strong>Hedef:</strong>
      <p class="mt-1">{{ sprint.goal }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sprint: {
    type: Object,
    required: true
  }
})

const daysRemaining = computed(() => {
  const today = new Date()
  const end = new Date(props.sprint.endDate)
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff : 0
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>
