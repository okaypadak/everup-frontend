<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navbar -->
    <div class="bg-white w-full h-16 flex items-center px-8 shadow">
      <Navbar />
    </div>

    <!-- İçerik -->
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg">

          <!-- Başlık -->
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-sky-700 flex items-center gap-2">
              📉 Sprint Burndown Grafiği
            </h1>
            <span class="text-sm text-gray-500">Sprint 14 – Haziran</span>
          </div>

          <!-- Grafik Alanı -->
          <div class="w-full" style="height: 320px;">
            <LineChart
                :data="chartData"
                :options="chartOptions"
                class="w-full h-full"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  LineElement, PointElement, CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const LineChart = Line

const chartData = {
  labels: ['1.Gün', '2.Gün', '3.Gün', '4.Gün', '5.Gün', '6.Gün', '7.Gün'],
  datasets: [
    {
      label: 'Beklenen Kalan Görev',
      data: [10, 8, 6, 4, 2, 1, 0],
      borderColor: '#38BDF8',
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    },
    {
      label: 'Gerçek Kalan Görev',
      data: [10, 9, 8, 7, 5, 3, 1],
      borderColor: '#3CB371',
      backgroundColor: 'rgba(60, 179, 113, 0.15)',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#374151',
        font: {
          size: 13,
          weight: '500'
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Kalan Görev Sayısı',
        color: '#4B5563',
        font: { weight: '600' }
      },
      ticks: { color: '#6B7280' },
      grid: {
        color: '#E5E7EB',
        borderDash: [4, 4]
      }
    },
    x: {
      title: {
        display: true,
        text: 'Sprint Günleri',
        color: '#4B5563',
        font: { weight: '600' }
      },
      ticks: { color: '#6B7280' },
      grid: {
        color: '#F3F4F6',
        borderDash: [4, 4]
      }
    }
  }
}
</script>
