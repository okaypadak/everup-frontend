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

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sky-300"
              :disabled="isCreatingMeeting"
              @click="createMeeting"
            >
              <span v-if="isCreatingMeeting" class="flex items-center gap-2">
                <Icon name="svg-spinners:90-ring-with-bg" class="h-4 w-4" aria-hidden="true" />
                Oluşturuluyor...
              </span>
              <span v-else>Yeni toplantı oluştur</span>
            </button>

            <p v-if="createMeetingError" class="text-sm text-red-600">{{ createMeetingError }}</p>
          </div>
        </form>
      </section>

      <section class="rounded-lg bg-white p-6 shadow">
        <VoiceRoom
          :room-id="normalizedRoomId"
          :username="username"
          :signaling-url="meetingSignalingUrl || undefined"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '/pages/components/bar/Navbar.vue'
import VoiceRoom from '~/pages/voice-room/components/VoiceRoom.vue'

const { user } = useAuth()
const route = useRoute()

const roomId = ref('')
const meetingSignalingUrl = ref('')
const isCreatingMeeting = ref(false)
const createMeetingError = ref('')

if (typeof route.query.roomId === 'string') {
  roomId.value = route.query.roomId
}

if (typeof route.query.signalingUrl === 'string') {
  meetingSignalingUrl.value = route.query.signalingUrl
}

watch(
  () => route.query.roomId,
  (value) => {
    roomId.value = typeof value === 'string' ? value : ''
    if (!value) {
      meetingSignalingUrl.value = ''
    }
  }
)

watch(
  () => route.query.signalingUrl,
  (value) => {
    meetingSignalingUrl.value = typeof value === 'string' ? value : ''
  }
)

watch(
  roomId,
  (value, previous) => {
    if (value !== previous && !isCreatingMeeting.value) {
      meetingSignalingUrl.value = ''
    }
  }
)

const username = computed(() => user.value?.name ?? '')
const normalizedRoomId = computed(() => roomId.value.trim())

const createMeeting = async () => {
  if (isCreatingMeeting.value) return
  isCreatingMeeting.value = true
  createMeetingError.value = ''

  try {
    const response = await $fetch<{ meetingId: string; signalingUrl?: string | null }>(
      '/api/voice/meetings',
      {
        method: 'POST',
      }
    )

    if (!response?.meetingId) {
      throw new Error('Toplantı kimliği alınamadı.')
    }

    roomId.value = response.meetingId
    meetingSignalingUrl.value = response.signalingUrl ?? ''
  } catch (error) {
    console.error('[voice-room] meeting create failed', error)
    createMeetingError.value =
      error instanceof Error ? error.message : 'Toplantı oluşturulurken bir hata oluştu.'
  } finally {
    isCreatingMeeting.value = false
  }
}
</script>

<style scoped>
main {
  min-height: calc(100vh - 4rem);
}
</style>
