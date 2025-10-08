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

type ParticipantPayload = {
  id: string
  username: string
  muted?: boolean
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
const socket = ref<WebSocket | null>(null)
const peerConnections = ref<Record<string, RTCPeerConnection>>({})
const clientId = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const isJoining = ref(false)

const joined = computed(() => voiceStore.joined)
const remoteParticipants = computed(() => voiceStore.remoteParticipants)

const runtimeConfig = useRuntimeConfig()
const resolveSignalingUrl = () => {
  if (props.signalingUrl) return props.signalingUrl
  if (!process.client) return ''
  const runtimeUrl = runtimeConfig.public?.voiceSignalingUrl
  if (runtimeUrl) return runtimeUrl
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/voice`
}

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

const sendSignal = (payload: Record<string, unknown>) => {
  if (!socket.value || socket.value.readyState !== WebSocket.OPEN) return
  socket.value.send(JSON.stringify(payload))
}

const closePeerConnection = (participantId: string) => {
  const connection = peerConnections.value[participantId]
  if (!connection) return
  connection.ontrack = null
  connection.onicecandidate = null
  connection.onconnectionstatechange = null
  connection.close()
  delete peerConnections.value[participantId]
}

const ensurePeerConnection = (participantId: string) => {
  let connection = peerConnections.value[participantId]
  if (connection) return connection
  connection = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
    ],
  })

  connection.ontrack = (event) => {
    const [stream] = event.streams
    if (stream) {
      voiceStore.setParticipantStream(participantId, stream)
      attachRemoteStream(participantId)
    }
  }

  connection.onicecandidate = (event) => {
    if (!event.candidate) return
    sendSignal({
      type: 'ice-candidate',
      targetId: participantId,
      candidate: {
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid ?? null,
        sdpMLineIndex: event.candidate.sdpMLineIndex ?? null,
      },
    })
  }

  connection.onconnectionstatechange = () => {
    if (
      connection.connectionState === 'failed' ||
      connection.connectionState === 'disconnected' ||
      connection.connectionState === 'closed'
    ) {
      closePeerConnection(participantId)
    }
  }

  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => {
      connection.addTrack(track, localStream.value as MediaStream)
    })
  }

  peerConnections.value[participantId] = connection
  return connection
}

const createOfferForParticipant = async (participantId: string) => {
  try {
    const connection = ensurePeerConnection(participantId)
    const offer = await connection.createOffer()
    await connection.setLocalDescription(offer)
    sendSignal({ type: 'offer', targetId: participantId, sdp: offer.sdp })
  } catch (error) {
    console.error('[voice] failed to create offer', error)
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
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })
    localStream.value = mediaStream
    voiceStore.setLocalStream(mediaStream)
    attachLocalStream()

    await new Promise<void>((resolve, reject) => {
      const url = resolveSignalingUrl()
      if (!url) {
        reject(new Error('Geçerli bir sinyalleşme adresi bulunamadı.'))
        return
      }
      const voiceSocket = new WebSocket(url)
      socket.value = voiceSocket

      voiceSocket.addEventListener('open', () => {
        voiceSocket.send(
          JSON.stringify({
            type: 'join',
            roomId: props.roomId,
            username: props.username,
          }),
        )
        resolve()
      })

      voiceSocket.addEventListener('error', (event) => {
        console.error('[voice] socket error', event)
        reject(new Error('Sinyalleşme sunucusuna bağlanırken hata oluştu.'))
      })

      voiceSocket.addEventListener('close', () => {
        if (joined.value) {
          errorMessage.value = 'Bağlantı kesildi.'
        }
        cleanup()
      })

      voiceSocket.addEventListener('message', async (event) => {
        try {
          const data = JSON.parse(event.data as string) as Record<string, any>
          switch (data.type) {
            case 'joined': {
              clientId.value = data.id as string
              const participants = (data.participants as ParticipantPayload[]) || []
              participants.forEach((participant) => {
                voiceStore.upsertParticipant(participant)
              })
              await Promise.all(
                participants.map(async (participant) => {
                  await createOfferForParticipant(participant.id)
                }),
              )
              voiceStore.markJoined(true)
              break
            }
            case 'participant-joined': {
              voiceStore.upsertParticipant(data.participant as ParticipantPayload)
              break
            }
            case 'participant-left': {
              closePeerConnection(data.id as string)
              voiceStore.removeParticipant(data.id as string)
              break
            }
            case 'participant-muted': {
              voiceStore.setParticipantMuted(data.id as string, Boolean(data.muted))
              break
            }
            case 'offer': {
              if (!localStream.value) break
              voiceStore.upsertParticipant({ id: data.fromId as string, username: data.username ?? 'Katılımcı' })
              {
                const connection = ensurePeerConnection(data.fromId as string)
                if (data.sdp) {
                  await connection.setRemoteDescription({ type: 'offer', sdp: data.sdp })
                  const answer = await connection.createAnswer()
                  await connection.setLocalDescription(answer)
                  sendSignal({ type: 'answer', targetId: data.fromId, sdp: answer.sdp })
                }
              }
              break
            }
            case 'answer': {
              const connection = peerConnections.value[data.fromId as string]
              if (connection && data.sdp) {
                await connection.setRemoteDescription({ type: 'answer', sdp: data.sdp })
              }
              break
            }
            case 'ice-candidate': {
              const connection = peerConnections.value[data.fromId as string]
              if (connection && data.candidate) {
                try {
                  await connection.addIceCandidate({
                    candidate: data.candidate.candidate,
                    sdpMid: data.candidate.sdpMid ?? undefined,
                    sdpMLineIndex: data.candidate.sdpMLineIndex ?? undefined,
                  })
                } catch (iceError) {
                  console.warn('[voice] failed to add ice candidate', iceError)
                }
              }
              break
            }
            case 'error': {
              errorMessage.value = typeof data.message === 'string' ? data.message : 'Bir hata oluştu.'
              break
            }
          }
        } catch (parseError) {
          console.warn('[voice] failed to parse signaling message', parseError)
        }
      })
    })
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
  voiceStore.setLocalMuted(shouldMute)
  sendSignal({ type: 'set-mute', muted: shouldMute })
}

const cleanup = async () => {
  Object.keys(peerConnections.value).forEach((participantId) => {
    closePeerConnection(participantId)
  })
  peerConnections.value = {}

  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(JSON.stringify({ type: 'leave' }))
  }
  socket.value?.close()
  socket.value = null
  clientId.value = null

  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop())
  }
  localStream.value = null
  voiceStore.setLocalStream(null)

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
