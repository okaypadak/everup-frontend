<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navbar -->
    <div class="bg-white w-full h-16 flex items-center px-8 shadow">
      <Navbar />
    </div>

    <!-- Ana İçerik -->
    <main class="flex-1">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="bg-white p-6 rounded-xl shadow-lg space-y-8">
          <!-- Başlık -->
          <h1 class="text-2xl font-bold text-sky-700">🧩 Görevleri Sprint'e Ata</h1>

          <!-- Sprint Seçimi ve Atama Paneli -->
          <SprintTaskAssignment @sprint-selected="onSprintSelected" />

          <!-- Sprint'e Atanmış Görevler -->
          <div v-if="selectedSprint">
            <h2 class="text-xl font-semibold text-gray-800 mb-3">
              📋 {{ selectedSprint.name }} - Görev Listesi
            </h2>
            <SprintTaskList :sprint-id="selectedSprint.id" />
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '../components/bar/Navbar.vue'
import Footer from '../components/bar/Footer.vue'
import SprintTaskAssignment from '../components/sprint/SprintTaskAssignment.vue'
import SprintTaskList from '../components/sprint/SprintTaskList.vue'

const selectedSprint = ref(null)

const onSprintSelected = (sprint) => {
  selectedSprint.value = sprint
}
</script>
