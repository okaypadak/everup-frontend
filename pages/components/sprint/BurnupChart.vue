<template>
  <div class="bg-white p-6 rounded-xl shadow space-y-4">
    <h2 class="text-lg font-semibold text-sky-700">📈 Burnup</h2>
    <div style="height: 320px">
      <Line :data="data" :options="opts" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as C, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js'
C.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps({ charts: { type: Object, required: true }})
const labels = computed(() => (props.charts.dates || []).map(d => new Date(d+'T00:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'short'})))
const data = computed(() => ({
  labels: labels.value,
  datasets: [
    { label:'Kümülatif Tamamlanan', data: props.charts.cumulativeCompleted || [], borderColor:'#10B981', backgroundColor:'rgba(16,185,129,.15)', borderWidth:2, tension:.35, pointRadius:3 },
    { label:'Toplam Kapsam', data: props.charts.scopePerDay || [], borderColor:'#374151', backgroundColor:'rgba(55,65,81,.10)', borderDash:[6,4], borderWidth:2, tension:.35, pointRadius:0 }
  ]
}))
const opts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' }}, scales:{ y:{ beginAtZero:true, ticks:{ precision:0 }}} }
</script>
