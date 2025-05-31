<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navbar -->
    <div class="bg-white h-16 flex items-center px-8 shadow shrink-0">
      <Navbar />
    </div>

    <!-- Ana İçerik -->
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">
          <!-- Başlık -->
          <h1 class="text-2xl font-bold text-sky-700">🚀 Aktif Sprint Özeti</h1>

          <div v-if="isSprintActive" class="space-y-6">
            <!-- Sprint Detayları -->
            <SprintMetaInfo :sprint="sprint" />
            <SprintProgressBar :completed="5" :total="8" />
            <SprintTaskTable :tasks="sprintTasks" />
          </div>

          <div v-else class="text-center py-10 text-gray-500">
            📭 Şu anda aktif bir sprint bulunmamaktadır.
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'
import SprintMetaInfo from '../components/sprint/SprintMetaInfo.vue'
import SprintProgressBar from '../components/sprint/SprintProgressBar.vue'
import SprintTaskTable from '../components/sprint/SprintTaskTable.vue'

// Sprint bilgileri
const sprint = {
  id: "sprint-14",
  name: "Sprint 14 - Haziran",
  startDate: "2025-05-29",
  endDate: "2025-06-14",
  goal: "Kullanıcı kayıt akışındaki hataları düzeltmek ve mobil responsive tasarımı tamamlamak."
}

// Görev listesi
const sprintTasks = [
  { id: 1, title: "Kayıt formu validasyon hatası", status: "Tamamlandı", type: "hata", seviye: "kritik", time: "2025-06-01" },
  { id: 2, title: "Mobil görünüm test et", status: "Bekliyor", type: "gorev", seviye: "öncelikli", time: "2025-06-02" },
  { id: 3, title: "Email doğrulama bug'ı düzelt", status: "Tamamlandı", type: "hata", seviye: "normal", time: "2025-06-03" },
  { id: 4, title: "Kayıt sonrası yönlendirme kontrolü", status: "Devam", type: "gorev", seviye: "normal", time: "2025-06-04" },
  { id: 5, title: "Mobil tuş tepkisizliği", status: "Bekliyor", type: "hata", seviye: "kritik", time: "2025-06-05" },
  { id: 6, title: "Şifre sıfırlama bağlantısı test edilsin", status: "Tamamlandı", type: "gorev", seviye: "önemsiz", time: "2025-06-06" },
  { id: 7, title: "Profil düzenleme sayfasında bug", status: "Tamamlandı", type: "hata", seviye: "öncelikli", time: "2025-06-07" },
  { id: 8, title: "Yeni kullanıcı kaydı sonrası e-posta yönlendirmesi", status: "Tamamlandı", type: "gorev", seviye: "normal", time: "2025-06-08" }
]

// Aktif sprint kontrolü (bugünün tarihi sprint aralığında mı?)
const isSprintActive = computed(() => {
  const today = new Date()
  const start = new Date(sprint.startDate)
  const end = new Date(sprint.endDate)
  return today >= start && today <= end
})
</script>
