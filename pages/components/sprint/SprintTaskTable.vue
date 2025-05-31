<template>
  <div class="mt-6">
    <h2 class="text-lg font-semibold text-sky-700 mb-4">📋 Görev ve Hata Durum Tablosu</h2>

    <div class="overflow-x-auto rounded-xl border border-blue-100 shadow-sm bg-white">
      <table class="min-w-full text-sm text-left text-gray-700">
        <thead class="bg-blue-50 text-gray-600 font-medium">
        <tr>
          <th class="px-4 py-3">Tür</th>
          <th class="px-4 py-3">Başlık</th>
          <th class="px-4 py-3">Durum</th>
          <th class="px-4 py-3">Seviye</th>
          <th class="px-4 py-3">Tarih</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in tasks" :key="item.id" class="border-t hover:bg-blue-50 transition">
          <td class="px-4 py-3">
              <span :class="item.type === 'hata' ? 'text-red-500' : 'text-blue-600'">
                {{ item.type === 'hata' ? '🐞 Hata' : '🛠 Görev' }}
              </span>
          </td>
          <td class="px-4 py-3 font-medium text-gray-800">{{ item.title }}</td>
          <td class="px-4 py-3">
              <span
                  :class="{
                  'text-green-600 font-semibold': item.status === 'Tamamlandı',
                  'text-yellow-600 font-semibold': item.status === 'Devam',
                  'text-gray-500 italic': item.status === 'Bekliyor'
                }"
              >
                {{ item.status }}
              </span>
          </td>
          <td class="px-4 py-3 capitalize">{{ item.seviye }}</td>
          <td class="px-4 py-3 text-sm text-gray-500">{{ item.time }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tasks: {
    type: Array,
    required: true
  }
})
</script>
