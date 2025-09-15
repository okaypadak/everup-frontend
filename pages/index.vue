<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-sky-200 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
      <!-- Logo -->
      <div class="mb-6">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="32" rx="27" ry="15" stroke="#3CB371" stroke-width="4" />
          <ellipse cx="32" cy="32" rx="15" ry="27" stroke="#38BDF8" stroke-width="4" />
          <path d="M32 16 C38 10, 54 20, 38 32 Q32 38, 26 32 C10 20, 26 10, 32 16 Z" fill="#3CB371" fill-opacity="0.12" />
        </svg>
      </div>

      <h2 class="text-3xl font-bold text-sky-700 mb-2 tracking-tight">EverUp</h2>
      <p class="text-sm text-black mb-8 text-center">Projelerini kolayca yönet, sürdürülebilir başarıya ulaş.</p>

      <form class="w-full space-y-5" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-semibold text-black mb-1">Eposta</label>
          <input v-model="email" type="email" placeholder="eposta gir" class="input-field text-black" required />
        </div>
        <div>
          <label class="block text-sm font-semibold text-black mb-1">Şifre</label>
          <input v-model="password" type="password" placeholder="••••••••" class="input-field text-black" required />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-gradient-to-r from-sky-600 to-green-500 text-white font-semibold rounded-lg shadow hover:scale-105 transition transform duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Giriş Yap</span>
          <span v-else>Giriş yapılıyor…</span>
        </button>

        <p v-if="error" class="text-red-600 text-sm mt-2 text-center">{{ error }}</p>
      </form>

      <div class="mt-8 text-xs text-black text-center">
        <span>© 2025 EverUp • Sürdürülebilir Proje Asistanı</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value) // cookie set + fetchMe içeride
    await router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Kullanıcı adı veya şifre hatalı'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@reference 'tailwindcss';
.input-field {
  @apply w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition;
}
</style>
