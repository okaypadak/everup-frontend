<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <div class="bg-white w-full h-16 flex items-center px-8 shadow-sm border-b border-gray-200">
      <Navbar />
    </div>

    <!-- İçerik -->
    <div class="max-w-5xl mx-auto px-4 py-10">
      <div class="bg-white p-8 rounded-2xl shadow-lg space-y-10 border border-gray-100">

        <!-- Başlık ve Durum Butonları -->
        <header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-sky-700 flex items-center gap-2">
              <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 7h16M4 12h8m-8 5h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ task.title }}
            </h1>
            <p class="text-sm text-gray-500">Oluşturulma Tarihi: {{ formatDate(task.createdAt) }}</p>
            <p v-if="task.status === 'Hazır'" class="mt-1 text-xs text-green-600 font-medium">Başlamaya hazır ✅</p>
          </div>

          <!-- Durum Güncelleme Butonları -->
          <div class="flex gap-2 flex-wrap">
            <button
                v-for="statusOption in statusOptions"
                :key="statusOption.value"
                @click="updateStatus(statusOption.value)"
                :class="[
                'px-3 py-1 text-sm rounded-lg font-medium border shadow-sm transition-all',
                task.status === statusOption.value
                  ? statusOption.activeClass
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
              ]"
            >
              {{ statusOption.label }}
            </button>
          </div>
        </header>

        <!-- Görev Açıklaması -->
        <section>
          <h2 class="text-lg font-semibold text-blue-700 mb-2">📄 Görev Açıklaması</h2>
          <p class="text-gray-700 bg-blue-50 p-4 rounded-md border border-blue-100 leading-relaxed whitespace-pre-line">
            {{ task.description }}
          </p>
        </section>

        <!-- Bağlı Görevler -->
        <section v-if="task.dependencies.length">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">🔗 Bağlı Görevler</h2>
          <ul class="grid sm:grid-cols-2 gap-4">
            <li
                v-for="dep in task.dependencies"
                :key="dep.id"
                class="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
            >
              <span class="text-gray-800 font-medium">{{ dep.title }}</span>
              <span
                  class="text-xs font-semibold px-2 py-1 rounded"
                  :class="{
                  'bg-green-100 text-green-700': dep.status === 'Tamamlandı',
                  'bg-yellow-100 text-yellow-800': dep.status === 'Devam'
                }"
              >
                {{ dep.status }}
              </span>
            </li>
          </ul>
        </section>

        <!-- Yorumlar -->
        <section>
          <h2 class="text-lg font-semibold text-gray-700 mb-4">💬 Yorumlar</h2>

          <!-- Yorum listesi -->
          <div v-if="task.comments.length" class="space-y-3 max-h-64 overflow-y-auto pr-1">
            <div
                v-for="comment in task.comments"
                :key="comment.id"
                class="bg-white p-4 rounded-md border border-gray-200 shadow-sm"
            >
              <p class="text-gray-800">{{ comment.content }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ comment.author }} – {{ formatDate(comment.date) }}</p>
            </div>
          </div>
          <p v-else class="text-gray-400 italic">Henüz yorum yapılmamış.</p>

          <!-- Yeni yorum -->
          <form @submit.prevent="submitComment" class="mt-6 space-y-3">
            <textarea
                v-model="newComment"
                rows="4"
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200"
                placeholder="Yorumunuzu yazın..."
            ></textarea>
            <button
                type="submit"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            >
              Yorum Ekle
            </button>
          </form>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Navbar from "~/pages/components/bar/Navbar.vue";

const task = ref({
  title: 'API dokümantasyonu güncelle',
  description: `CycleUp API'de yapılan son güncellemeler sonrasında dökümantasyon güncellenmeli. Özellikle yeni filtreleme endpoint'leri eklenmeli.`,
  createdAt: '2025-05-28',
  status: 'Hazır',
  dependencies: [
    { id: 1, title: 'Kullanıcı testi', status: 'Tamamlandı' }
  ],
  comments: [
    { id: 1, content: 'Filtreleme endpoint’i eklendi mi kontrol edilebilir.', author: 'Zeynep', date: '2025-05-30' },
    { id: 2, content: 'Swagger tarafı eksik kalmış, ona da bakacağım.', author: 'Ali', date: '2025-05-31' }
  ]
});

const statusOptions = [
  { value: 'Hazır', label: 'Başlamaya Hazır', activeClass: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'Devam', label: 'Görev Başlatıldı', activeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'Tamamlandı', label: 'Tamamlandı', activeClass: 'bg-green-100 text-green-700 border-green-300' }
];

const newComment = ref('');

function updateStatus(newStatus) {
  task.value.status = newStatus;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

function submitComment() {
  if (newComment.value.trim() !== '') {
    task.value.comments.push({
      id: Date.now(),
      content: newComment.value,
      author: 'Siz',
      date: new Date().toISOString()
    });
    newComment.value = '';
  }
}
</script>
