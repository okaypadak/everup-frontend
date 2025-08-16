<template>
  <footer class="bg-white border-t border-gray-200 mt-12 py-6">
    <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">

      <!-- Sol kısım -->
      <div class="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="32" rx="10" ry="4" stroke="#3CB371" stroke-width="2" />
          <ellipse cx="32" cy="32" rx="4" ry="10" stroke="#38BDF8" stroke-width="2" />
        </svg>
        <span>© 2025 EverUp Takip Sistemi</span>
      </div>

      <!-- Sağ kısım -->
      <div class="flex flex-wrap gap-4">
        <a href="/dashboard" class="hover:underline hover:text-sky-600">Projeler</a>
        <a href="/sprint" class="hover:underline hover:text-sky-600">Sprintler</a>
        <a href="/reports" class="hover:underline hover:text-sky-600">Raporlar</a>
        <a href="/about" class="hover:underline hover:text-sky-600">Hakkında</a>
      </div>
    </div>
  </footer>
</template>
