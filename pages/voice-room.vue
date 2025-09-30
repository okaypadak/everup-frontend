<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <main class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <section class="rounded-lg bg-white p-6 shadow">
        <h1 class="text-2xl font-semibold text-slate-900">Toplantı Odası</h1>
        <p class="mt-2 text-sm text-slate-600">
          Sesli toplantı odasına katılmak için aşağıdaki alana toplantı kimliğini girin.
        </p>

        <form class="mt-6 flex flex-col gap-4" @submit.prevent>
          <label class="text-sm font-medium text-slate-700" for="voice-room-id">Toplantı Kimliği</label>
          <input
            id="voice-room-id"
            v-model="roomId"
            type="text"
            placeholder="örn. haftalik-planlama"
            class="w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            @blur="roomId = roomId.trim()"
          />
          <p v-if="!normalizedRoomId" class="text-sm text-slate-500">
            Toplantıya katılmak için önce bir kimlik girin, ardından "Odaya Katıl" butonunu kullanın.
          </p>
        </form>
      </section>

      <section class="rounded-lg bg-white p-6 shadow">
        <VoiceRoom :room-id="normalizedRoomId" :username="username" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/bar/Navbar.vue'
import VoiceRoom from '~/components/VoiceRoom.vue'

const { user } = useAuth()
const route = useRoute()

const roomId = ref('')

if (typeof route.query.roomId === 'string') {
  roomId.value = route.query.roomId
}

watch(
  () => route.query.roomId,
  (value) => {
    roomId.value = typeof value === 'string' ? value : ''
  }
)

const username = computed(() => user.value?.name ?? '')
const normalizedRoomId = computed(() => roomId.value.trim())
</script>

<style scoped>
main {
  min-height: calc(100vh - 4rem);
}
</style>
