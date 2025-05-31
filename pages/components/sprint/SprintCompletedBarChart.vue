<template>
  <div class="bg-white p-6 rounded-xl shadow space-y-4">
    <h2 class="text-lg font-semibold text-sky-700">📉 Sprint Burndown Grafiği</h2>
    <div class="w-full" style="height: 320px;">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

// Chart.js bileşenlerini kaydet
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// Props tanımı
const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

// Görev durumlarına göre sayım
const taskCounts = computed(() => {
  const result = {
    Tamamlandı: 0,
    Devam: 0,
    Bekliyor: 0
  }

  if (Array.isArray(props.tasks)) {
    props.tasks.forEach(task => {
      if (result[task.status] !== undefined) {
        result[task.status]++
      }
    })
  }

  return result
})

// ChartJS veri formatı
const chartData = computed(() => ({
  labels: Object.keys(taskCounts.value),
  datasets: [
    {
      label: 'Görev Sayısı',
      data: Object.values(taskCounts.value),
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'], // Tamamlandı, Devam, Bekliyor
      borderRadius: 6,
      barThickness: 30
    }
  ]
}))

// ChartJS seçenekler
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Görev Sayısı',
        color: '#4B5563',
        font: { weight: '600' }
      },
      ticks: { color: '#6B7280' },
      grid: { color: '#E5E7EB' }
    },
    x: {
      ticks: { color: '#6B7280' },
      grid: { display: false }
    }
  }
}
</script>