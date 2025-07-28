<template>
  <nav class="bg-white px-4 py-2 flex items-center justify-between w-full border-b border-gray-200 shadow-sm">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="32" rx="27" ry="15" stroke="#3CB371" stroke-width="3" />
        <ellipse cx="32" cy="32" rx="15" ry="27" stroke="#38BDF8" stroke-width="3" />
        <path
d="M32 16 C38 10, 54 20, 38 32 Q32 38, 26 32 C10 20, 26 10, 32 16 Z"
              fill="#3CB371" fill-opacity="0.12" />
      </svg>
      <span class="text-2xl font-extrabold tracking-tight text-sky-700">EverUp</span>
    </div>

    <!-- Menü Linkleri -->
    <div class="hidden md:flex gap-6 items-center">
      <NuxtLink to="/dashboard" class="nav-link">Kontrol Paneli</NuxtLink>
      <NuxtLink to="/documentList" class="nav-link">Döküman Yaz</NuxtLink>

      <!-- Sprint Menüsü -->
      <div v-if="canSeeSprintMenu" class="relative">
        <button class="nav-link flex items-center gap-1" @click="toggleSprintMenu">
          Sprint Yönetimi
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
v-if="showSprintMenu"
             class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 w-64">
          <NuxtLink v-if="isDirector" to="/sprint/create" class="dropdown-item" @click="showSprintMenu = false">
            Sprint Oluştur
          </NuxtLink>
          <NuxtLink v-if="isDirector" to="/sprint/task-list" class="dropdown-item" @click="showSprintMenu = false">
            Sprint Görev Listesi
          </NuxtLink>
          <NuxtLink to="/sprint/meta" class="dropdown-item" @click="showSprintMenu = false">
            Sprint Meta Bilgileri
          </NuxtLink>
          <NuxtLink to="/sprint/chart" class="dropdown-item" @click="showSprintMenu = false">
            Sprint Charts
          </NuxtLink>
        </div>
      </div>

      <!-- Proje Menüsü -->
      <div v-if="canSeeProjectMenu" class="relative">
        <button class="nav-link flex items-center gap-1" @click="toggleProjectMenu">
          Proje Yönetimi
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
v-if="showProjectMenu"
             class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 w-64">
          <NuxtLink to="/projects/create" class="dropdown-item" @click="showProjectMenu = false">
            Proje Oluştur
          </NuxtLink>
          <NuxtLink to="/projects/members" class="dropdown-item" @click="showProjectMenu = false">
            Katılımcılar
          </NuxtLink>
        </div>
      </div>

      <!-- Müşteri Menüsü -->
      <div class="relative">
        <button class="nav-link flex items-center gap-1" @click="toggleCustomerMenu">
          Müşteri Yönetimi
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
            v-if="showCustomerMenu"
            class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 w-64"
        >
          <NuxtLink to="/customers/create" class="dropdown-item" @click="showCustomerMenu = false">
            Müşteri Kaydet
          </NuxtLink>
          <NuxtLink to="/customers/marketing" class="dropdown-item" @click="showCustomerMenu = false">
            Pazarlama Takip
          </NuxtLink>
          <NuxtLink to="/customers/calendar" class="dropdown-item" @click="showCustomerMenu = false">
            Takvim / Randevu
          </NuxtLink>
        </div>
      </div>

      <!-- Kullanıcı Menüsü -->
      <div v-if="canSeeUserMenu" class="relative">
        <button class="nav-link flex items-center gap-1" @click="toggleUserManagementMenu">
          Kullanıcı Yönetimi
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
v-if="showUserManagementMenu"
             class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 w-64">
          <NuxtLink to="/users/create" class="dropdown-item" @click="showUserManagementMenu = false">
            Kullanıcı Oluştur
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Sağ Kısım: Bildirim ve Kullanıcı -->
    <div class="flex items-center gap-4">
      <!-- Bildirim -->
      <button class="relative p-2 rounded-full hover:bg-sky-100 transition" @click="showNotifications = !showNotifications">
        <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.163 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span
v-if="notifications > 0"
              class="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"/>
      </button>

      <!-- Kullanıcı Profili -->
      <div v-if="isLoggedIn" class="relative">
        <button class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-sky-100 transition" @click="showUserMenu = !showUserMenu">
          <span class="font-semibold text-gray-700 hidden sm:inline">{{ user.name }}</span>
          <svg
class="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" stroke-width="2"
               viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div
v-if="showUserMenu"
             class="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg py-2 z-50">
          <button class="dropdown-item text-red-600" @click="logout">Çıkış Yap</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const { user, isLoggedIn, isDirector } = useAuth()

const router = useRouter()

const showSprintMenu = ref(false)
const showProjectMenu = ref(false)
const showUserManagementMenu = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)
const showCustomerMenu = ref(false)
const notifications = ref(3)

// Menü kontrolü için roller
const canSeeSprintMenu = computed(() =>
    ['admin', 'teamLead', 'director', 'developer'].includes(user.value?.role ?? '')
)

const canSeeProjectMenu = computed(() =>
    ['admin', 'director'].includes(user.value?.role ?? '')
)

const canSeeUserMenu = computed(() =>
    user.value?.role === 'admin'
)

const toggleSprintMenu = () => showSprintMenu.value = !showSprintMenu.value
const toggleProjectMenu = () => showProjectMenu.value = !showProjectMenu.value
const toggleUserManagementMenu = () => showUserManagementMenu.value = !showUserManagementMenu.value
const toggleCustomerMenu = () => showCustomerMenu.value = !showCustomerMenu.value

const logout = async () => {
  await $fetch('/api/logout', { method: 'POST' })
  user.value = { name: '', avatar: '', role: '' }
  router.push('/')
}
</script>

<style scoped>
.nav-link {
  font-size: 1rem;
  font-weight: 500;
  color: #0369a1;
  transition: color 0.2s;
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
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
  background: none;
  border: none;
  outline: none;
}
.dropdown-item:hover {
  background-color: #e0f2fe;
}
</style>
