<template>
  <nav class="bg-white px-4 py-2 flex items-center justify-between w-full">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="32" rx="27" ry="15" stroke="#3CB371" stroke-width="3" />
        <ellipse cx="32" cy="32" rx="15" ry="27" stroke="#38BDF8" stroke-width="3" />
        <path d="M32 16 C38 10, 54 20, 38 32 Q32 38, 26 32 C10 20, 26 10, 32 16 Z"
              fill="#3CB371" fill-opacity="0.12" />
      </svg>
      <span class="text-2xl font-extrabold tracking-tight text-sky-700">CycleUp</span>
    </div>

    <!-- Menü Linkleri -->
    <div class="hidden md:flex gap-6 items-center">
      <a href="/dashboard" class="nav-link">Projeler</a>

      <!-- Sprint Menüsü (Tıkla → Aç/Kapat) -->
      <div class="relative">
        <button @click="showSprintMenu = !showSprintMenu" class="nav-link flex items-center gap-1">
          Sprint Yönetimi
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
            v-if="showSprintMenu"
            class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 w-64"
        >
          <a href="/sprint/create" class="dropdown-item" @click="showSprintMenu = false">Sprint Oluştur</a>
          <a href="/sprint/task-list" class="dropdown-item" @click="showSprintMenu = false">Sprint Görev Listesi</a>
          <a href="/sprint/meta" class="dropdown-item" @click="showSprintMenu = false">Sprint Meta Bilgileri</a>
          <a href="/sprint/burndown" class="dropdown-item" @click="showSprintMenu = false">Burndown Chart</a>
        </div>
      </div>

<!--      <a href="/reports" class="nav-link">Raporlar</a>-->
    </div>

    <!-- Sağ Kısım: Bildirim ve Kullanıcı -->
    <div class="flex items-center gap-4">
      <!-- Bildirim -->
      <button class="relative p-2 rounded-full hover:bg-sky-100 transition" @click="showNotifications = !showNotifications">
        <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.163 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span v-if="notifications > 0"
              class="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
      </button>

      <!-- Kullanıcı Menüsü (Tıkla → Aç/Kapat) -->
      <div class="relative">
        <button @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-sky-100 transition">
          <img :src="user.avatar" alt="Kullanıcı" class="w-8 h-8 rounded-full object-cover border border-sky-200" />
          <span class="font-semibold text-gray-700 hidden sm:inline">{{ user.name }}</span>
          <svg class="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" stroke-width="2"
               viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div v-if="showUserMenu"
             class="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg py-2 z-50">
          <a href="/profile" class="dropdown-item" @click="showUserMenu = false">Profil</a>
          <a href="/settings" class="dropdown-item" @click="showUserMenu = false">Ayarlar</a>
          <button @click="logout" class="dropdown-item text-red-600">Çıkış Yap</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const showSprintMenu = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)

const user = {
  name: "Ayşe Yılmaz",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg"
}

const notifications = ref(3)

const logout = () => {
  alert('Çıkış yapıldı!')
}
</script>

<style scoped>
.nav-link {
  font-size: 1rem;
  font-weight: 500;
  color: #0369a1;
  transition: color .2s;
  text-decoration: none;
}
.nav-link:hover {
  color: #059669;
  text-decoration: underline;
}
.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}
.dropdown-item:hover {
  background-color: #e0f2fe;
}
</style>
