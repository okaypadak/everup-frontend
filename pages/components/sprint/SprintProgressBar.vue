<template>
  <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
    <h2 class="text-lg font-semibold text-sky-700 mb-2">📈 Sprint İlerleme Durumu</h2>

    <div class="flex items-center justify-between mb-2">
      <span class="text-sm text-gray-600">Tamamlanan Görevler:</span>
      <span class="text-sm text-gray-800 font-medium">
        {{ completed }} / {{ total }} ({{ percent }}%)
      </span>
    </div>

    <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
      <div
          class="h-full bg-sky-500 transition-all duration-500"
          :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  completed: { type: Number, required: true },
  total: { type: Number, required: true }
})

const percent = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.completed / props.total) * 100)
})
</script>
