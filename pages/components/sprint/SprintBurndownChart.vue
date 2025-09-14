<template>
  <div class="bg-white p-6 rounded-xl shadow space-y-4">
    <h2 class="text-lg font-semibold text-sky-700">📉 Sprint Burndown Grafiği</h2>

    <div v-if="hasData" class="w-full" style="height: 320px;">
      <Line :data="chartData" :options="chartOptions" class="w-full h-full" />
    </div>

    <div v-else class="text-black text-sm py-8 text-center">
      Gösterilecek veri bulunamadı.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  LineElement, PointElement, CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

/**
 * Beklenen prop yapısı (backend summary):
 * charts = {
 *   dates: string[]            // 'YYYY-MM-DD'
 *   ideal: number[]            // ideal kalan iş
 *   actualRemaining: number[]  // gerçek kalan iş
 * }
 */
const props = defineProps({
  charts: {
    type: Object,
    required: false,
    default: () => ({ dates: [], ideal: [], actualRemaining: [] })
  }
})

const labels = computed(() =>
    (props.charts?.dates ?? []).map(d =>
        new Date(d + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
    )
)

const len = computed(() =>
    Math.min(
        props.charts?.dates?.length ?? 0,
        props.charts?.ideal?.length ?? 0,
        props.charts?.actualRemaining?.length ?? 0
    )
)

const hasData = computed(() => len.value > 0)

const chartData = computed(() => ({
  labels: labels.value.slice(0, len.value),
  datasets: [
    {
      label: 'Beklenen Kalan Görev',
      data: (props.charts?.ideal ?? []).slice(0, len.value),
      borderColor: '#38BDF8',
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    },
    {
      label: 'Gerçek Kalan Görev',
      data: (props.charts?.actualRemaining ?? []).slice(0, len.value),
      borderColor: '#3CB371',
      backgroundColor: 'rgba(60, 179, 113, 0.15)',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#374151',
        font: { size: 13, weight: '500' }
      }
    },
    tooltip: { mode: 'index', intersect: false }
  },
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Kalan Görev Sayısı',
        color: '#4B5563',
        font: { weight: '600' }
      },
      ticks: { color: '#6B7280', precision: 0 },
      grid: { color: '#E5E7EB', borderDash: [4, 4] }
    },
    x: {
      title: {
        display: true,
        text: 'Sprint Günleri',
        color: '#4B5563',
        font: { weight: '600' }
      },
      ticks: { color: '#6B7280' },
      grid: { color: '#F3F4F6', borderDash: [4, 4] }
    }
  }
}
</script>
