<!-- components/sprint/SprintCompletedTasksChart.vue -->
<template>
  <div class="bg-white p-6 rounded-xl shadow space-y-4">
    <h2 class="text-lg font-semibold text-sky-700">📊 Tamamlanan Görevler</h2>

    <div v-if="hasSeries" class="w-full" style="height: 320px;">
      <!-- Zaman serisi: Günlük tamamlanan (bar) + kümülatif (line) -->
      <Bar :data="chartDataTimeSeries" :options="chartOptionsTimeSeries" />
    </div>

    <div v-else class="w-full" style="height: 320px;">
      <!-- Fallback: Durum dağılımı -->
      <Bar :data="chartDataDistribution" :options="chartOptionsDistribution" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale
} from 'chart.js'

// Chart.js bileşenlerini kaydet
ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale)

/**
 * Props:
 * - charts: backend özetinden gelen zaman serisi verisi
 *    {
 *      dates: string[]               // 'YYYY-MM-DD'
 *      completedPerDay: number[]     // günlük tamamlanan
 *      cumulativeCompleted: number[] // kümülatif tamamlanan
 *    }
 * - tasks: fallback için görev listesi (status / statusLabel)
 */
const props = defineProps<{
  charts?: {
    dates?: string[]
    completedPerDay?: number[]
    cumulativeCompleted?: number[]
  } | null
  tasks?: Array<{
    id: number
    title: string
    status?: string
    statusLabel?: string
  }>
}>()

/* ----------------------- Helpers ----------------------- */
const fmtTR = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })

const labelsTS = computed(() => (props.charts?.dates ?? []).map(fmtTR))

const seriesLen = computed(() =>
    Math.min(
        props.charts?.dates?.length ?? 0,
        props.charts?.completedPerDay?.length ?? 0,
        props.charts?.cumulativeCompleted?.length ?? 0
    )
)

const hasSeries = computed(() => seriesLen.value > 0)

/* ---------------- Zaman Serisi (Tercih edilen) ---------------- */
const chartDataTimeSeries = computed(() => ({
  labels: labelsTS.value.slice(0, seriesLen.value),
  datasets: [
    {
      type: 'bar' as const,
      label: 'Günlük Tamamlanan',
      data: (props.charts?.completedPerDay ?? []).slice(0, seriesLen.value),
      backgroundColor: 'rgba(16, 185, 129, 0.35)', // emerald-500 ~ %35
      borderRadius: 6,
      barThickness: 26,
      yAxisID: 'y'
    },
    {
      type: 'line' as const,
      label: 'Kümülatif Tamamlanan',
      data: (props.charts?.cumulativeCompleted ?? []).slice(0, seriesLen.value),
      borderColor: '#3B82F6', // blue-500
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      yAxisID: 'y2'
    }
  ]
}))

const chartOptionsTimeSeries = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#374151', font: { size: 13, weight: '500' } }
    },
    tooltip: { mode: 'index' as const, intersect: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Günlük Tamamlanan', color: '#4B5563', font: { weight: '600' } },
      ticks: { color: '#6B7280', precision: 0 },
      grid: { color: '#E5E7EB' }
    },
    y2: {
      beginAtZero: true,
      position: 'right' as const,
      title: { display: true, text: 'Kümülatif', color: '#4B5563', font: { weight: '600' } },
      ticks: { color: '#6B7280', precision: 0 },
      grid: { drawOnChartArea: false } // sağ eksen ızgarası gizli
    },
    x: {
      ticks: { color: '#6B7280' },
      grid: { display: false }
    }
  }
}

/* ---------------- Fallback: Durum Dağılımı ---------------- */
const counts = computed(() => {
  const res: Record<'Tamamlandı' | 'Devam' | 'Bekliyor', number> = {
    Tamamlandı: 0, Devam: 0, Bekliyor: 0
  }
  for (const t of props.tasks ?? []) {
    const key =
        (t.statusLabel && ['tamamlandı','devam','bekliyor'].includes(t.statusLabel.toLowerCase()))
            ? (t.statusLabel.charAt(0).toUpperCase() + t.statusLabel.slice(1)) // 'Tamamlandı' vb.
            : (t.status
                ? (t.status.toLowerCase() === 'completed' ? 'Tamamlandı'
                    : t.status.toLowerCase() === 'in_progress' ? 'Devam'
                        : 'Bekliyor')
                : 'Bekliyor')

    if (key in res) res[key as keyof typeof res]++
  }
  return res
})

const chartDataDistribution = computed(() => ({
  labels: Object.keys(counts.value),
  datasets: [
    {
      label: 'Görev Sayısı',
      data: Object.values(counts.value),
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'], // Tamamlandı, Devam, Bekliyor
      borderRadius: 6,
      barThickness: 30
    }
  ]
}))

const chartOptionsDistribution = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Görev Sayısı', color: '#4B5563', font: { weight: '600' } },
      ticks: { color: '#6B7280', precision: 0 },
      grid: { color: '#E5E7EB' }
    },
    x: {
      ticks: { color: '#6B7280' },
      grid: { display: false }
    }
  }
}
</script>
