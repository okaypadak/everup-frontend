<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-sky-200 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
      <!-- Logo -->
      <div class="mb-6">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="32" rx="27" ry="15" stroke="#3CB371" stroke-width="4" />
          <ellipse cx="32" cy="32" rx="15" ry="27" stroke="#38BDF8" stroke-width="4" />
          <path
d="M32 16 C38 10, 54 20, 38 32 Q32 38, 26 32 C10 20, 26 10, 32 16 Z"
                fill="#3CB371" fill-opacity="0.12" />
        </svg>
      </div>

      <h2 class="text-3xl font-bold text-sky-700 mb-2 tracking-tight">EverUp</h2>
      <p class="text-sm text-black mb-8 text-center">Projelerini kolayca yönet, sürdürülebilir başarıya ulaş.</p>

      <form class="w-full space-y-5" @submit.prevent="login">
        <div>
          <label class="block text-sm font-semibold text-black mb-1">Eposta</label>
          <input v-model="email" type="text" placeholder="eposta gir" class="input-field text-black" required >
        </div>
        <div>
          <label class="block text-sm font-semibold text-black mb-1">Şifre</label>
          <input v-model="password" type="password" placeholder="••••••••" class="input-field text-black" required >
        </div>

        <button
            type="submit"
            class="w-full py-2.5 bg-gradient-to-r from-sky-600 to-green-500 text-white font-semibold rounded-lg shadow hover:scale-105 transition transform duration-150"
        >
          Giriş Yap
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
import {useAuthStore} from "~/stores/authStore";

const { user } = useAuth()
const router = useRouter()
const error = ref('')
const email = ref('')
const password = ref('')
const authStore = useAuthStore()

async function login(): Promise<void> {
  try {
    const res = await $fetch<any>('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (res.statusCode === 200) {
      // 1. Token varsa sakla
      if (res.token) {
        localStorage.setItem('token', res.token)
      }

      // 2. Kullanıcı bilgisi al ve store'a set et
      const response = await $fetch('/api/me') // -> { name: 'Okay Padak', role: 'admin' }

      console.log(response)

      authStore.setUser({
        name: response.user.name,
        role: response.user.role
      })

      // 3. Yönlendirme
      router.push('/dashboard')
    } else {
      error.value = res.message || 'Kullanıcı adı veya şifre hatalı'
    }

  } catch (err) {
    console.error('İstek hatası:', err)
    error.value = 'Sunucuya erişilemiyor. Lütfen daha sonra tekrar deneyin.'
  }
}

</script>

<style scoped>
@reference 'tailwindcss';
.input-field {
  @apply w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition;
}
</style>
