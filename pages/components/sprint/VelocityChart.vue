<template>
  <div class="bg-white p-6 rounded-xl shadow space-y-4">
    <h2 class="text-lg font-semibold text-sky-700">⚡ Velocity (Son Sprintler)</h2>
    <div style="height: 320px">
      <Bar :data="data" :options="opts" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as C, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
C.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({ items: { type: Array, required: true }})
const data = computed(() => ({
  labels: (props.items || []).map(i => i.sprintName),
  datasets: [{ label:'Tamamlanan', data: (props.items || []).map(i => i.value), backgroundColor:'rgba(16,185,129,.45)', borderRadius:6, barThickness:28 }]
}))
const opts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }}, scales:{ y:{ beginAtZero:true, ticks:{ precision:0 }}, x:{ grid:{ display:false }}} }
</script>
