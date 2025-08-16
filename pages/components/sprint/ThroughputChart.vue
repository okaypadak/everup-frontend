<template>
  <div class="bg-white p-6 rounded-xl shadow space-y-4">
    <h2 class="text-lg font-semibold text-sky-700">📊 Günlük Tamamlanan (Throughput)</h2>
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

const props = defineProps({ charts: { type: Object, required: true }})
const labels = computed(() => (props.charts.dates || []).map(d => new Date(d+'T00:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'short'})))
const data = computed(() => ({
  labels: labels.value,
  datasets: [{ label:'Tamamlanan', data: props.charts.completedPerDay || [], backgroundColor:'rgba(59,130,246,.45)', borderRadius:6, barThickness:26 }]
}))
const opts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }}, scales:{ y:{ beginAtZero:true, ticks:{ precision:0 }}, x:{ grid:{ display:false }}} }
</script>
