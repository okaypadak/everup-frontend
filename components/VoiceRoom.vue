<template>
  <section class="voice-room">
    <header class="voice-room__header">
      <button
        class="voice-room__join"
        :disabled="isJoining || joined"
        @click="joinRoom"
      >
        {{ joined ? 'Bağlandın' : 'Odaya Katıl' }}
      </button>
      <button
        v-if="localStream"
        class="voice-room__mute"
        type="button"
        @click="toggleMute"
      >
        {{ voiceStore.localMuted ? 'Sesi Aç' : 'Sesi Kapat' }}
      </button>
    </header>

    <p v-if="errorMessage" class="voice-room__error">
      {{ errorMessage }}
    </p>

    <div v-if="localStream" class="voice-room__local">
      <video ref="localVideo" autoplay playsinline muted class="voice-room__video" />
      <span class="voice-room__label">{{ voiceStore.username || 'Sen' }}</span>
    </div>

    <div class="voice-room__remote-grid">
      <article
        v-for="participant in remoteParticipants"
        :key="participant.id"
        class="voice-room__remote-item"
        :data-muted="participant.muted"
      >
        <video
          autoplay
          playsinline
          class="voice-room__video"
          :data-muted="participant.muted"
          :ref="(el) => setRemoteVideoRef(participant.id, el)"
        />
        <footer class="voice-room__label">
          <span>{{ participant.username }}</span>
          <span v-if="participant.muted" aria-label="katılımcı sessizde">🔇</span>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useVoiceStore } from '~/stores/voiceStore'
import { createVoiceSocket, type VoiceSocket } from '~/composables/voice/socket'
import {
  createRecvTransport,
  createSendTransport,
  type RecvTransport,
  type SendTransport,
  type TransportOptions,
} from '~/composables/voice/webrtc'

type ParticipantPayload = {
  id: string
  username: string
  muted?: boolean
}

type ParticipantListResponse = Array<ParticipantPayload>

type JoinResponse = {
  id: string
}

interface JoinRoomProps {
  roomId: string
  username: string
  signalingUrl?: string
}

const props = defineProps<JoinRoomProps>()

const voiceStore = useVoiceStore()
const localVideo = ref<HTMLVideoElement | null>(null)
const localStream = ref<MediaStream | null>(null)
const remoteVideoRefs = ref<Record<string, HTMLVideoElement | null>>({})
const socket = ref<VoiceSocket | null>(null)
const sendTransport = ref<SendTransport | null>(null)
const recvTransports = ref<Record<string, RecvTransport>>({})
const detachSocketEvents = ref<(() => void) | null>(null)
const errorMessage = ref<string | null>(null)
const isJoining = ref(false)

const joined = computed(() => voiceStore.joined)
const remoteParticipants = computed(() => voiceStore.remoteParticipants)

const runtimeConfig = useRuntimeConfig()
const resolveSignalingUrl = () =>
  props.signalingUrl || runtimeConfig.public?.voiceSignalingUrl || 'ws://localhost:4000/voice'

const attachLocalStream = () => {
  if (!process.client) return
  if (!localVideo.value || !localStream.value) return
  if ('srcObject' in localVideo.value) {
    localVideo.value.srcObject = localStream.value
  }
}

const attachRemoteStream = (participantId: string) => {
  if (!process.client) return
  const video = remoteVideoRefs.value[participantId]
  const participant = voiceStore.participants[participantId]
  if (video && participant?.stream) {
    video.srcObject = participant.stream
  }
}

const setRemoteVideoRef = (participantId: string, el: HTMLVideoElement | null) => {
  if (!el) {
    delete remoteVideoRefs.value[participantId]
    return
  }
  remoteVideoRefs.value[participantId] = el
  if (el) {
    attachRemoteStream(participantId)
  }
}

const setupRecvForParticipant = async (payload: ParticipantPayload) => {
  if (!socket.value || recvTransports.value[payload.id]) return
  try {
    const transportOptions = (await socket.value.request('create-transport', {
      direction: 'recv',
      participantId: payload.id,
    })) as TransportOptions
    const transport = await createRecvTransport(socket.value, {
      ...transportOptions,
      participantId: payload.id,
    })
    recvTransports.value[payload.id] = transport
    voiceStore.setParticipantStream(payload.id, transport.stream)
    attachRemoteStream(payload.id)
  } catch (error) {
    console.error('[voice] failed to create recv transport', error)
  }
}

const registerSocketEvents = (voiceSocket: VoiceSocket) => {
  const handleParticipantJoined = async (payload: ParticipantPayload) => {
    voiceStore.upsertParticipant(payload)
    await setupRecvForParticipant(payload)
  }

  const handleParticipantLeft = (payload: { id: string }) => {
    const transport = recvTransports.value[payload.id]
    transport?.close()
    delete recvTransports.value[payload.id]
    voiceStore.removeParticipant(payload.id)
  }

  const handleParticipantMuted = (payload: { id: string; muted: boolean }) => {
    voiceStore.setParticipantMuted(payload.id, payload.muted)
  }

  const handleParticipantUpdated = (payload: ParticipantPayload) => {
    voiceStore.upsertParticipant(payload)
  }

  voiceSocket.on('participant-joined', handleParticipantJoined)
  voiceSocket.on('participant-left', handleParticipantLeft)
  voiceSocket.on('participant-muted', handleParticipantMuted)
  voiceSocket.on('participant-updated', handleParticipantUpdated)

  return () => {
    voiceSocket.off('participant-joined', handleParticipantJoined)
    voiceSocket.off('participant-left', handleParticipantLeft)
    voiceSocket.off('participant-muted', handleParticipantMuted)
    voiceSocket.off('participant-updated', handleParticipantUpdated)
  }
}

const joinRoom = async () => {
  if (!process.client || joined.value) return
  if (!props.roomId || !props.username) {
    errorMessage.value = 'Katılım için oda ve kullanıcı bilgileri gerekli.'
    return
  }

  isJoining.value = true
  errorMessage.value = null

  try {
    voiceStore.setIdentity({ roomId: props.roomId, username: props.username })

    const voiceSocket = createVoiceSocket(resolveSignalingUrl())
    socket.value = voiceSocket
    await voiceSocket.connect()

    await voiceSocket.request<JoinResponse>('join-room', {
      roomId: props.roomId,
      username: props.username,
    })

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })
    localStream.value = mediaStream
    voiceStore.setLocalStream(mediaStream)
    attachLocalStream()

    const sendTransportOptions = (await voiceSocket.request('create-transport', {
      direction: 'send',
    })) as TransportOptions
    sendTransport.value = await createSendTransport(voiceSocket, sendTransportOptions)
    await sendTransport.value.publish(mediaStream)

    const participants = (await voiceSocket.request('participants')) as ParticipantListResponse
    await Promise.all(
      participants.map(async (participant) => {
        voiceStore.upsertParticipant(participant)
        await setupRecvForParticipant(participant)
      }),
    )

    detachSocketEvents.value = registerSocketEvents(voiceSocket)
    voiceStore.markJoined(true)
  } catch (error) {
    console.error('[voice] failed to join room', error)
    errorMessage.value =
      error instanceof Error ? error.message : 'Odaya katılırken bir hata oluştu.'
    await cleanup()
    voiceStore.reset()
    voiceStore.setIdentity({ roomId: props.roomId, username: props.username })
  } finally {
    isJoining.value = false
  }
}

const toggleMute = async () => {
  if (!localStream.value) return
  const shouldMute = !voiceStore.localMuted
  localStream.value.getAudioTracks().forEach((track) => {
    track.enabled = !shouldMute
  })
  if (shouldMute) {
    sendTransport.value?.pause(localStream.value)
  } else {
    sendTransport.value?.resume(localStream.value)
  }
  voiceStore.setLocalMuted(shouldMute)
  socket.value?.emit('set-mute', {
    muted: shouldMute,
  })
}

const cleanup = async () => {
  sendTransport.value?.close()
  sendTransport.value = null

  Object.values(recvTransports.value).forEach((transport) => transport.close())
  recvTransports.value = {}

  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop())
  }
  localStream.value = null
  voiceStore.setLocalStream(null)

  detachSocketEvents.value?.()
  detachSocketEvents.value = null

  if (socket.value?.isConnected()) {
    socket.value.emit('leave-room', {
      roomId: voiceStore.roomId,
    })
  }
  socket.value?.disconnect()
  socket.value = null

  Object.keys(voiceStore.participants).forEach((participantId) => {
    voiceStore.removeParticipant(participantId)
  })
  voiceStore.setLocalMuted(false)
  voiceStore.markJoined(false)
}

onMounted(() => {
  if (!process.client) return
  if (props.roomId && props.username) {
    voiceStore.setIdentity({ roomId: props.roomId, username: props.username })
  }
  if (voiceStore.localStream) {
    localStream.value = voiceStore.localStream
    attachLocalStream()
  }
})

onBeforeUnmount(async () => {
  await cleanup()
  voiceStore.reset()
})

watch(
  () => voiceStore.remoteParticipants,
  (participants) => {
    participants.forEach((participant) => attachRemoteStream(participant.id))
  },
  { deep: true },
)
</script>

<style scoped>
.voice-room {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.75);
  border-radius: 1rem;
  color: #f8fafc;
}

.voice-room__header {
  display: flex;
  gap: 0.75rem;
}

.voice-room__join,
.voice-room__mute {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  transition: filter 0.2s ease;
}

.voice-room__join[disabled] {
  cursor: not-allowed;
  filter: grayscale(1);
}

.voice-room__mute {
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.voice-room__error {
  color: #f87171;
  font-weight: 500;
}

.voice-room__local,
.voice-room__remote-item {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.6);
}

.voice-room__video {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #0f172a;
  object-fit: cover;
}

.voice-room__label {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  background: rgba(15, 23, 42, 0.85);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.voice-room__remote-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.voice-room__remote-item[data-muted='true'] .voice-room__video {
  filter: grayscale(1);
}
</style>
