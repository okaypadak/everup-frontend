<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />

    <main class="flex-1">
      <div class="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <header class="bg-white shadow rounded-2xl px-6 py-5 flex flex-col gap-4">
          <div class="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p class="text-sm uppercase tracking-widest text-sky-500 font-semibold">EveryUp</p>
              <h1 class="text-3xl font-black text-slate-800">Sesli Sohbet Odası</h1>
              <p class="text-slate-600 mt-2 max-w-2xl">
                Proje ekibinizi Mediasoup tabanlı düşük gecikmeli ses odasında buluşturun. Aşağıdan oda bilgilerini
                doldurup mikrofonunuzu açmanız yeterli.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="status-pill" :class="connectionStatusClass">{{ connectionStatusLabel }}</span>
              <span class="status-pill" :class="isMicMuted ? 'bg-orange-200 text-orange-800' : 'bg-emerald-100 text-emerald-700'">
                {{ isMicMuted ? 'Mikrofon Kapalı' : 'Mikrofon Açık' }}
              </span>
              <span class="status-pill" :class="isRoomLocked ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'">
                {{ isRoomLocked ? 'Oda Kilitli' : 'Oda Açık' }}
              </span>
            </div>
          </div>

          <div v-if="infoMessage" class="px-4 py-3 rounded-xl bg-sky-50 text-sky-700 text-sm flex items-center gap-3">
            <Icon name="i-heroicons-information-circle" class="w-5 h-5" />
            <span>{{ infoMessage }}</span>
          </div>
        </header>

        <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section class="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <label class="form-label">Oda Kodu</label>
                <input
                    v-model="requestedRoomId"
                    type="text"
                    placeholder="örn. core-standup"
                    class="form-input"
                />
              </div>
              <div>
                <label class="form-label">Ekran Adınız</label>
                <input
                    v-model="displayName"
                    type="text"
                    placeholder="Ad Soyad"
                    class="form-input"
                />
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <button
                  type="button"
                  class="primary-btn"
                  :disabled="!canJoinRoom || joinLoading"
                  @click="joinRoom"
              >
                <span v-if="joinLoading">Odaya bağlanılıyor...</span>
                <span v-else-if="isInRoom">Odadayım</span>
                <span v-else>Odaya Katıl</span>
              </button>
              <button
                  type="button"
                  class="secondary-btn"
                  :disabled="!isInRoom"
                  @click="leaveRoom"
              >
                Odadan Ayrıl
              </button>
              <button
                  type="button"
                  class="secondary-btn"
                  :disabled="!isInRoom || !hasMic"
                  @click="toggleMute"
              >
                {{ isMicMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat' }}
              </button>
            </div>

            <div class="rounded-2xl border border-dashed border-slate-200 p-6 min-h-[220px] flex flex-col gap-4">
              <div class="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p class="text-xs uppercase tracking-wide text-slate-500">Aktif Oda</p>
                  <p class="text-lg font-semibold text-slate-800">
                    {{ isInRoom ? activeRoomId : 'Henüz katılmadınız' }}
                  </p>
                </div>
                <div v-if="isInRoom" class="text-sm text-slate-500">
                  {{ participants.length }} katılımcı · {{ hostLabel }}
                </div>
              </div>

              <div v-if="isInRoom">
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div class="flex items-center gap-2 text-sm text-slate-500">
                    <Icon name="i-heroicons-microphone-20-solid" class="w-4 h-4 text-slate-600" />
                    Yerel Mikrofon
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="relative">
                      <div
                          class="h-20 w-20 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-2xl font-semibold shadow-inner transition-all duration-200"
                          :class="isLocalSpeaking ? 'ring-4 ring-emerald-300 shadow-emerald-200/80 scale-105' : ''"
                      >
                        <span>{{ displayInitials }}</span>
                      </div>
                      <span
                          v-if="isLocalSpeaking"
                          class="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow"
                      >
                        Konuşuyor
                      </span>
                    </div>
                    <div>
                      <p class="text-base font-semibold text-slate-800">{{ effectiveDisplayName }}</p>
                      <p class="text-sm" :class="isMicMuted ? 'text-rose-500' : 'text-emerald-600'">
                        {{ isMicMuted ? 'Sessizde' : 'Canlı yayında' }}
                      </p>
                      <p v-if="localMicWarning" class="text-xs text-rose-500 mt-1">{{ localMicWarning }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center text-slate-500 text-sm">
                Oda bilgilerini doldurup bağlanın. Hazır olduğunuzda mikrofon izni isteyeceğiz.
              </div>
            </div>
          </section>

          <aside class="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div>
              <h2 class="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Icon name="i-heroicons-user-group" class="w-5 h-5 text-sky-600" /> Katılımcılar
              </h2>
              <div class="space-y-3 max-h-[420px] overflow-auto pr-1">
                <div v-if="participants.length === 0" class="text-sm text-slate-500">
                  Aktif katılımcı yok.
                </div>
                <div
                    v-for="peer in participants"
                    :key="peer.id"
                    class="flex items-center justify-between p-3 rounded-xl border transition shadow-sm"
                    :class="isSpeaking(peer.id) ? 'bg-emerald-50/80 border-emerald-200 shadow-emerald-100' : 'bg-slate-50 border-slate-100'"
                >
                  <div class="space-y-1">
                    <p class="font-semibold text-slate-800 flex items-center gap-2">
                      <span>{{ peer.username }}</span>
                      <span
                          v-if="isSpeaking(peer.id)"
                          class="inline-flex items-center gap-1 text-[11px] font-semibold uppercase text-emerald-600"
                      >
                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Konuşuyor
                      </span>
                    </p>
                    <p class="text-xs text-slate-500">{{ peer.id }}</p>
                  </div>
                  <div class="text-xs flex items-center gap-2">
                    <span v-if="peer.isHost" class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Host</span>
                    <span class="px-2 py-0.5 rounded-full" :class="peer.muted ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'">
                      {{ peer.muted ? 'Sessiz' : 'Aktif' }}
                    </span>
                    <span
                        v-if="isSpeaking(peer.id)"
                        class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-semibold uppercase text-[10px] animate-pulse"
                    >
                      Canlı
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 class="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Icon name="i-heroicons-bolt" class="w-5 h-5 text-indigo-600" /> Oturum Kaydı
              </h2>
              <ul class="space-y-2 text-sm text-slate-600 max-h-[220px] overflow-auto pr-1">
                <li v-for="log in activityLog" :key="log.id" class="flex gap-2">
                  <span class="text-xs text-slate-400">{{ log.time }}</span>
                  <span>{{ log.message }}</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <div class="sr-only" aria-hidden="true">
          <audio
              v-for="entry in remoteAudioEntries"
              :key="entry.consumerId"
              playsinline
              autoplay
              :ref="remoteAudioRefFactory(entry.consumerId)"
          ></audio>
          <audio
              :ref="bindLocalPreview"
              autoplay
              playsinline
              muted
          ></audio>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, type ComponentPublicInstance } from 'vue'
import { toast } from 'vue3-toastify'
import Navbar from '~/pages/components/bar/Navbar.vue'
import type { Device as MediasoupDevice } from 'mediasoup-client'

type MediasoupTransport = ReturnType<MediasoupDevice['createSendTransport']>
type MediasoupProducer = Awaited<ReturnType<MediasoupTransport['produce']>>
type MediasoupConsumer = Awaited<ReturnType<MediasoupTransport['consume']>>
type RtpCapabilities = NonNullable<MediasoupDevice['rtpCapabilities']>

interface Participant {
  id: string;
  username: string;
  muted: boolean;
  isHost: boolean;
}

interface JoinedPayload {
  roomId: string;
  clientId: string;
  isHost: boolean;
  routerRtpCapabilities: RtpCapabilities;
  participants: Participant[];
  locked: boolean;
}

interface TransportPayload {
  id: string;
  direction: 'send' | 'recv';
  iceParameters: any;
  iceCandidates: any[];
  dtlsParameters: any;
}

interface ConsumedPayload {
  consumerId: string;
  producerId: string;
  kind: 'audio';
  rtpParameters: any;
  producerPaused: boolean;
}

interface ActivityLogItem {
  id: string;
  message: string;
  time: string;
}

interface RemoteAudioEntry {
  consumerId: string;
  peerId: string;
  username?: string;
  stream: MediaStream;
}

const runtimeConfig = useRuntimeConfig()
useHead({ title: 'EverUp • Sesli Sohbet' })

const requestedRoomId = ref('everyup-daily')
const displayName = ref('')
const activeRoomId = ref<string | null>(null)
const participants = ref<Participant[]>([])
const clientId = ref<string>('')
const joinLoading = ref(false)
const infoMessage = ref('Ses servisi ile güvenli bir WebSocket bağlantısı kuruyoruz...')
const isRoomLocked = ref(false)
const connectionState = ref<'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'>('idle')
const isMicMuted = ref(true)
const localMicWarning = ref('')
const hasMic = ref(false)
const activityLog = ref<ActivityLogItem[]>([])
const remoteAudioEntries = ref<RemoteAudioEntry[]>([])
const wsAuthToken = ref<string | null>(null)
const speakingPeers = reactive<Record<string, boolean>>({})
const audioContextRef = ref<AudioContext | null>(null)
const localPeerKey = computed(() => clientId.value || 'local')

const resolveRoomId = () => (activeRoomId.value || requestedRoomId.value.trim() || '')

const wsRef = ref<WebSocket | null>(null)
const socketReady = ref(false)
const deviceRef = ref<MediasoupDevice | null>(null)
const sendTransportRef = ref<MediasoupTransport | null>(null)
const recvTransportRef = ref<MediasoupTransport | null>(null)
const localProducerRef = ref<MediasoupProducer | null>(null)
const localStreamRef = ref<MediaStream | null>(null)

const producerPeerMap = new Map<string, string>()
const consumerMap = new Map<string, MediasoupConsumer>()
const audioElements = new Map<string, HTMLAudioElement>()
let localPreviewEl: HTMLAudioElement | null = null
const SPEAKING_THRESHOLD = 0.02
const SPEAKING_HOLD_MS = 3000
const speakingHoldMap = new Map<string, number>()

type DeviceCtor = new () => MediasoupDevice
let DeviceClass: DeviceCtor | null = null

const transportPromises = new Map<'send' | 'recv', { resolve: () => void; reject: (error: Error) => void }>()
const pendingConnects = new Map<string, { resolve: () => void; reject: (error: Error) => void }>()
const pendingProduceCallbacks: Array<{ resolve: (id: string) => void; reject: (error: Error) => void }> = []

const connectionStatusLabel = computed(() => {
  switch (connectionState.value) {
    case 'connecting':
      return 'Bağlanıyor'
    case 'connected':
      return 'Bağlantı Hazır'
    case 'error':
      return 'Hata'
    case 'disconnected':
      return 'Bağlantı Kapalı'
    default:
      return 'Hazır Değil'
  }
})

const connectionStatusClass = computed(() => {
  switch (connectionState.value) {
    case 'connected':
      return 'bg-emerald-100 text-emerald-700'
    case 'connecting':
      return 'bg-sky-100 text-sky-700'
    case 'error':
      return 'bg-rose-100 text-rose-700'
    case 'disconnected':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
})

const isInRoom = computed(() => Boolean(activeRoomId.value))
const canJoinRoom = computed(() => Boolean(requestedRoomId.value.trim()) && socketReady.value)
const effectiveDisplayName = computed(() => displayName.value || participants.value.find(p => p.id === clientId.value)?.username || 'Siz')
const hostLabel = computed(() => {
  if (!participants.value.length) return 'Host bekleniyor'
  const host = participants.value.find(p => p.isHost)
  if (!host) return 'Host atanmamış'
  return `${host.username} host`
})
const handleRemoteAudioRef = (consumerId: string, el: Element | ComponentPublicInstance | null) => {
  if (!process.client) return
  const audio = (el as HTMLAudioElement | null)
  if (!audio) {
    audioElements.delete(consumerId)
    return
  }
  audioElements.set(consumerId, audio)
  attachStream(consumerId)
}

const remoteAudioRefFactory = (consumerId: string) => (el: Element | ComponentPublicInstance | null) => handleRemoteAudioRef(consumerId, el)

const bindLocalPreview = (el: Element | ComponentPublicInstance | null) => {
  if (!process.client) return
  const audio = el as HTMLAudioElement | null
  localPreviewEl = audio
  if (audio && localStreamRef.value) {
    audio.srcObject = localStreamRef.value
    void audio.play()
  }
}

const displayInitials = computed(() => {
  const name = effectiveDisplayName.value.trim()
  if (!name) return 'EV'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase()
  const first = parts[0]?.[0] || ''
  const last = parts[parts.length - 1]?.[0] || ''
  return `${first}${last}`.toUpperCase()
})

const logActivity = (message: string) => {
  const entry: ActivityLogItem = {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    message,
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  }
  activityLog.value = [entry, ...activityLog.value].slice(0, 25)
}

const fetchWsAuthToken = async (): Promise<string> => {
  if (!process.client) {
    throw new Error('client-environment-required')
  }
  try {
    const response = await fetch('/api/voice/ws-token', { credentials: 'same-origin' })
    if (!response.ok) {
      throw new Error(`voice-token-request-failed:${response.status}`)
    }
    const payload = await response.json()
    if (!payload?.token || typeof payload.token !== 'string') {
      throw new Error('voice-token-missing')
    }
    const token = payload.token as string
    wsAuthToken.value = token
    return token
  } catch (error) {
    console.error('Voice WS token fetch failed', error)
    infoMessage.value = 'Ses servisine erişim izni alınamadı. Lütfen tekrar giriş yapın.'
    connectionState.value = 'error'
    throw error
  }
}

type LevelMonitor = {
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  sink: GainNode;
  dataArray: Uint8Array;
  rafId: number | null;
  streamId: string;
  isLocal: boolean;
}

const levelMonitors = new Map<string, LevelMonitor>()

const ensureAudioContext = () => {
  if (!process.client) return null
  if (!audioContextRef.value) {
    audioContextRef.value = new AudioContext()
  }
  if (audioContextRef.value.state === 'suspended') {
    void audioContextRef.value.resume().catch(() => {})
  }
  return audioContextRef.value
}

const setPeerSpeaking = (peerId: string, state: boolean) => {
  if (!peerId) return
  if (speakingPeers[peerId] === state) return
  speakingPeers[peerId] = state
  if (!state) {
    speakingHoldMap.delete(peerId)
  }
}

const handleSpeakingSample = (peerId: string, isActive: boolean, options?: { force?: boolean }) => {
  if (!peerId) return
  const force = Boolean(options?.force)
  if (!process.client) {
    setPeerSpeaking(peerId, isActive)
    return
  }
  if (isActive) {
    speakingHoldMap.set(peerId, performance.now())
    setPeerSpeaking(peerId, true)
    return
  }
  if (force) {
    setPeerSpeaking(peerId, false)
    return
  }
  const lastActive = speakingHoldMap.get(peerId)
  if (typeof lastActive !== 'number') {
    setPeerSpeaking(peerId, false)
    return
  }
  if (performance.now() - lastActive >= SPEAKING_HOLD_MS) {
    setPeerSpeaking(peerId, false)
  } else {
    setPeerSpeaking(peerId, true)
  }
}

const stopLevelMonitor = (peerId: string) => {
  if (!process.client) return
  const monitor = levelMonitors.get(peerId)
  if (!monitor) {
    handleSpeakingSample(peerId, false, { force: true })
    return
  }
  if (monitor.rafId !== null) {
    cancelAnimationFrame(monitor.rafId)
  }
  monitor.source.disconnect()
  monitor.analyser.disconnect()
  monitor.sink.disconnect()
  levelMonitors.delete(peerId)
  handleSpeakingSample(peerId, false, { force: true })
}

const startLevelMonitor = (peerId: string, stream: MediaStream, options?: { isLocal?: boolean }) => {
  if (!process.client || !peerId) return
  const audioContext = ensureAudioContext()
  if (!audioContext) return
  const existing = levelMonitors.get(peerId)
  if (existing?.streamId === stream.id) return
  stopLevelMonitor(peerId)
  const source = audioContext.createMediaStreamSource(stream)
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 512
  const sink = audioContext.createGain()
  sink.gain.value = 0
  source.connect(analyser)
  analyser.connect(sink)
  sink.connect(audioContext.destination)
  const dataArray = new Uint8Array(analyser.fftSize)
  const monitor: LevelMonitor = {
    analyser,
    source,
    sink,
    dataArray,
    rafId: null,
    streamId: stream.id,
    isLocal: Boolean(options?.isLocal),
  }
  const update = () => {
    analyser.getByteTimeDomainData(dataArray)
    let sumSquares = 0
    for (let i = 0; i < dataArray.length; i += 1) {
      const sample = dataArray[i] ?? 128
      const deviation = sample - 128
      sumSquares += deviation * deviation
    }
    const rms = Math.sqrt(sumSquares / dataArray.length) / 128
    const speaking = rms > SPEAKING_THRESHOLD && (!monitor.isLocal || !isMicMuted.value)
    handleSpeakingSample(peerId, speaking)
    monitor.rafId = requestAnimationFrame(update)
  }
  monitor.rafId = requestAnimationFrame(update)
  levelMonitors.set(peerId, monitor)
}

const resetSpeakingIndicators = () => {
  if (process.client) {
    levelMonitors.forEach((_, key) => {
      stopLevelMonitor(key)
    })
  }
  speakingHoldMap.clear()
  Object.keys(speakingPeers).forEach((key) => {
    delete speakingPeers[key]
  })
}

const isSpeaking = (peerId?: string) => Boolean(peerId && speakingPeers[peerId])
const isLocalSpeaking = computed(() => isSpeaking(localPeerKey.value))

if (process.client) {
  watch(remoteAudioEntries, (entries) => {
    const activePeers = new Set<string>()
    entries.forEach((entry) => {
      activePeers.add(entry.peerId)
      startLevelMonitor(entry.peerId, entry.stream)
    })
    const stalePeers: string[] = []
    levelMonitors.forEach((monitor, peerId) => {
      if (monitor.isLocal) return
      if (!activePeers.has(peerId)) {
        stalePeers.push(peerId)
      }
    })
    stalePeers.forEach(peerId => stopLevelMonitor(peerId))
  }, { deep: true })
}

watch(clientId, (newId, oldId) => {
  if (!newId || newId === oldId) return
  const previousKey = oldId || 'local'
  const wasSpeaking = Boolean(speakingPeers[previousKey])
  if (process.client && localStreamRef.value) {
    if (levelMonitors.has(previousKey)) {
      stopLevelMonitor(previousKey)
      startLevelMonitor(newId, localStreamRef.value, { isLocal: true })
    }
  }
  if (wasSpeaking) {
    const last = speakingHoldMap.get(previousKey)
    if (typeof last === 'number') {
      speakingHoldMap.set(newId, last)
    }
    setPeerSpeaking(newId, true)
  }
  if (previousKey !== newId) {
    speakingHoldMap.delete(previousKey)
    delete speakingPeers[previousKey]
  }
})

watch(participants, (list) => {
  const allowed = new Set(list.map(peer => peer.id))
  Object.keys(speakingPeers).forEach((key) => {
    if (key === localPeerKey.value) return
    if (!allowed.has(key)) {
      if (process.client) {
        stopLevelMonitor(key)
      }
      speakingHoldMap.delete(key)
      delete speakingPeers[key]
    }
  })
})

const ensureWsAuthToken = async (): Promise<string> => {
  if (wsAuthToken.value) return wsAuthToken.value
  return await fetchWsAuthToken()
}

const computeVoiceWsUrl = (token?: string) => {
  const explicit = runtimeConfig.public.voiceWsUrl
  const source = explicit || runtimeConfig.public.apiBaseUrl || (process.client ? window.location.origin : '')
  if (!source) return ''
  try {
    const url = new URL(source)
    if (!explicit) {
      url.pathname = `${url.pathname.replace(/\/$/, '')}/ws/voice`
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    }
    if (token) {
      url.searchParams.set('token', token)
    }
    return url.toString()
  } catch (err) {
    console.error('WS URL oluşturulamadı', err)
    return ''
  }
}

const connectSocket = async () => {
  if (!process.client) {
    throw new Error('client-environment-required')
  }
  if (wsRef.value) {
    return
  }

  const authToken = await ensureWsAuthToken()
  const url = computeVoiceWsUrl(authToken)
  if (!url) {
    infoMessage.value = 'WebSocket adresi ayarlanamadı. Lütfen yapılandırmayı kontrol edin.'
    connectionState.value = 'error'
    throw new Error('voice-ws-url-missing')
  }

  connectionState.value = 'connecting'
  const socket = new WebSocket(url)
  wsRef.value = socket

  return new Promise<void>((resolve, reject) => {
    let settled = false

    const handleResolve = () => {
      if (settled) return
      settled = true
      resolve()
    }

    const handleReject = (reason: Error) => {
      if (settled) return
      settled = true
      reject(reason)
    }

    socket.addEventListener('open', () => {
      socketReady.value = true
      connectionState.value = 'connected'
      infoMessage.value = 'Bağlantı hazır, dilediğiniz odaya katılabilirsiniz.'
      logActivity('Ses servisiyle bağlantı kuruldu')
      console.info(`[VoiceRoom] WebSocket connected to ${url}`)
      handleResolve()
    })

    socket.addEventListener('message', event => {
      try {
        const payload = JSON.parse(event.data)
        handleSocketMessage(payload)
      } catch (error) {
        console.error('WS parse error', error)
      }
    })

    socket.addEventListener('close', (event) => {
      socketReady.value = false
      connectionState.value = 'disconnected'
      if (event.code === 4401 || event.code === 4003) {
        wsAuthToken.value = null
        infoMessage.value = 'Ses servisi yetkilendirmesi doğrulanamadı. Lütfen oturumu yenileyin.'
      } else {
        infoMessage.value = 'Bağlantı kapandı. Odaya katılım için tekrar bağlanın.'
      }
      wsRef.value = null
      cleanupMedia()
    })

    socket.addEventListener('error', (event) => {
      connectionState.value = 'error'
      infoMessage.value = 'Ses servisine bağlanırken sorun oluştu.'
      const error = new Error('voice-ws-connection-error')
      console.error('[VoiceRoom] WS connection error', event)
      handleReject(error)
    })
  })
}

const sendMessage = (type: string, data: Record<string, any> = {}) => {
  if (wsRef.value && wsRef.value.readyState === WebSocket.OPEN) {
    wsRef.value.send(JSON.stringify({ type, data }))
  } else {
    toast.error('Ses servisi hazır değil, lütfen bağlantıyı kontrol edin.')
  }
}

const joinRoom = async () => {
  if (!canJoinRoom.value || joinLoading.value) return
  joinLoading.value = true
  infoMessage.value = 'Odaya katılım isteği gönderildi...'
  sendMessage('join', {
    roomId: requestedRoomId.value.trim(),
    username: displayName.value.trim() || undefined,
  })
}

const leaveRoom = () => {
  if (!activeRoomId.value) return
  sendMessage('leave', { roomId: activeRoomId.value })
  infoMessage.value = 'Odadan çıkış yapıldı.'
  logActivity('Odadan ayrıldınız')
  resetRoomState()
}

const resetRoomState = () => {
  activeRoomId.value = null
  participants.value = []
  isRoomLocked.value = false
  cleanupMedia()
}

const cleanupMedia = () => {
  localProducerRef.value?.close()
  localProducerRef.value = null
  sendTransportRef.value?.close()
  recvTransportRef.value?.close()
  sendTransportRef.value = null
  recvTransportRef.value = null
  localStreamRef.value?.getTracks().forEach(track => track.stop())
  localStreamRef.value = null
  hasMic.value = false
  localMicWarning.value = ''
  remoteAudioEntries.value = []
  consumerMap.clear()
  producerPeerMap.clear()
  audioElements.clear()
  resetSpeakingIndicators()
}

const toggleMute = async () => {
  const roomId = resolveRoomId()
  if (!localProducerRef.value || !localStreamRef.value || !roomId) return
  isMicMuted.value = !isMicMuted.value
  localStreamRef.value.getAudioTracks().forEach(track => {
    track.enabled = !isMicMuted.value
  })
  if (isMicMuted.value) {
    handleSpeakingSample(localPeerKey.value, false, { force: true })
  }
  try {
    if (isMicMuted.value) {
      await localProducerRef.value.pause()
    } else {
      await localProducerRef.value.resume()
    }
    sendMessage('set-mute', { roomId, muted: isMicMuted.value })
  } catch (error) {
    console.error('Mute error', error)
  }
}

const ensureDevice = async (routerCaps: RtpCapabilities) => {
  if (deviceRef.value) return
  if (!DeviceClass) {
    const mod = await import('mediasoup-client')
    DeviceClass = mod.Device as DeviceCtor
  }
  const device = new DeviceClass()
  await device.load({ routerRtpCapabilities: routerCaps })
  deviceRef.value = device
}

const handleJoined = async (payload: JoinedPayload) => {
  try {
    await ensureDevice(payload.routerRtpCapabilities)
    activeRoomId.value = payload.roomId
    isRoomLocked.value = payload.locked
    participants.value = payload.participants
    isMicMuted.value = true
    logActivity(`'${payload.roomId}' odasına katıldınız`)
    infoMessage.value = 'Mikrofon izinleri alınacak ve bağlantı kurulacak.'

    await setupTransport('send')
    await setupTransport('recv')
    await startLocalAudio()
  } catch (error: any) {
    console.error('Join flow failed', error)
    toast.error('Odaya bağlanırken hata oluştu')
  } finally {
    joinLoading.value = false
  }
}

const setupTransport = async (direction: 'send' | 'recv') => {
  return new Promise<void>((resolve, reject) => {
    const roomId = resolveRoomId()
    if (!roomId) {
      reject(new Error('room-id-missing'))
      return
    }
    transportPromises.set(direction, { resolve, reject })
    sendMessage('create-transport', { roomId, direction })
  })
}

const startLocalAudio = async () => {
  if (!sendTransportRef.value || !process.client) return
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    localStreamRef.value = stream
    hasMic.value = true
    const track = stream.getAudioTracks()[0]
    if (localPreviewEl) {
      localPreviewEl.srcObject = stream
      void localPreviewEl.play()
    }
    const producer = await sendTransportRef.value.produce({ track })
    localProducerRef.value = producer
    isMicMuted.value = false
    localMicWarning.value = ''
    logActivity('Mikrofon paylaşılıyor')
    startLevelMonitor(localPeerKey.value, stream, { isLocal: true })
  } catch (error: any) {
    console.error('Mic error', error)
    hasMic.value = false
    localMicWarning.value = 'Mikrofon açılamadı, tarayıcı izinlerini kontrol edin.'
    toast.error('Mikrofon izni reddedildi')
  }
}

const handleTransportCreated = (data: TransportPayload) => {
  const device = deviceRef.value
  if (!device) return
  const roomId = resolveRoomId()
  if (!roomId) return
  try {
    if (data.direction === 'send') {
      const transport = device.createSendTransport({
        id: data.id,
        iceParameters: data.iceParameters,
        iceCandidates: data.iceCandidates,
        dtlsParameters: data.dtlsParameters,
      })
      transport.on('connect', ({ dtlsParameters }, callback, errback) => {
        pendingConnects.set(transport.id, { resolve: callback, reject: errback })
        sendMessage('connect-transport', { roomId, transportId: transport.id, dtlsParameters })
      })
      transport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
        pendingProduceCallbacks.push({ resolve: id => callback({ id }), reject: errback })
        sendMessage('produce', {
          roomId,
          transportId: transport.id,
          kind,
          rtpParameters,
        })
      })
      transport.on('connectionstatechange', state => {
        if (state === 'failed') {
          toast.error('Ses gönderim transportu düştü')
        }
      })
      sendTransportRef.value = transport
    } else {
      const transport = device.createRecvTransport({
        id: data.id,
        iceParameters: data.iceParameters,
        iceCandidates: data.iceCandidates,
        dtlsParameters: data.dtlsParameters,
      })
      transport.on('connect', ({ dtlsParameters }, callback, errback) => {
        pendingConnects.set(transport.id, { resolve: callback, reject: errback })
        sendMessage('connect-transport', { roomId, transportId: transport.id, dtlsParameters })
      })
      recvTransportRef.value = transport
    }
    transportPromises.get(data.direction)?.resolve()
  } catch (error: any) {
    transportPromises.get(data.direction)?.reject(error)
    console.error('Transport create error', error)
  } finally {
    transportPromises.delete(data.direction)
  }
}

const handleTransportConnected = (transportId: string) => {
  const pending = pendingConnects.get(transportId)
  if (pending) {
    pending.resolve()
    pendingConnects.delete(transportId)
  }
}

const handleProduced = (producerId: string) => {
  const pending = pendingProduceCallbacks.shift()
  if (pending) pending.resolve(producerId)
  logActivity('Mikrofon servise aktarıldı')
}

const consumeProducer = (producerId: string, peerId: string) => {
  const roomId = resolveRoomId()
  if (!recvTransportRef.value || !deviceRef.value || !roomId) return
  producerPeerMap.set(producerId, peerId)
  sendMessage('consume', {
    roomId,
    transportId: recvTransportRef.value.id,
    producerId,
    rtpCapabilities: deviceRef.value.rtpCapabilities,
  })
}

const handleConsumed = async (payload: ConsumedPayload) => {
  const transport = recvTransportRef.value
  if (!transport) return
  try {
    const consumer = await transport.consume({
      id: payload.consumerId,
      producerId: payload.producerId,
      kind: payload.kind,
      rtpParameters: payload.rtpParameters,
    })
    const stream = new MediaStream([consumer.track])
    const peerId = producerPeerMap.get(payload.producerId) || 'bilinmiyor'
    const username = participants.value.find(p => p.id === peerId)?.username
    const entry: RemoteAudioEntry = { consumerId: payload.consumerId, peerId, username, stream }
    remoteAudioEntries.value = [...remoteAudioEntries.value.filter(item => item.consumerId !== payload.consumerId), entry]
    consumerMap.set(payload.consumerId, consumer)
    consumer.on('transportclose', () => removeConsumer(payload.consumerId))
    consumer.observer.on('close', () => removeConsumer(payload.consumerId))
    await nextTick()
    attachStream(payload.consumerId)
    const roomId = resolveRoomId()
    if (roomId) {
      sendMessage('resume-consumer', { roomId, consumerId: payload.consumerId })
    }
  } catch (error) {
    console.error('Consume error', error)
  }
}

const removeConsumer = (consumerId: string) => {
  const consumer = consumerMap.get(consumerId)
  consumer?.close()
  consumerMap.delete(consumerId)
  remoteAudioEntries.value = remoteAudioEntries.value.filter(entry => entry.consumerId !== consumerId)
  audioElements.delete(consumerId)
}

const attachStream = (consumerId: string) => {
  const el = audioElements.get(consumerId)
  const entry = remoteAudioEntries.value.find(item => item.consumerId === consumerId)
  if (el && entry) {
    el.srcObject = entry.stream
    el.autoplay = true
    el.setAttribute('playsinline', 'true')
    void el.play().catch(() => {})
  }
}

const updateParticipants = (list: Participant[]) => {
  participants.value = list
  remoteAudioEntries.value = remoteAudioEntries.value.map(entry => ({
    ...entry,
    username: list.find(p => p.id === entry.peerId)?.username || entry.username,
  }))
}

const handleSocketMessage = (message: { type: string; data?: any }) => {
  switch (message.type) {
    case 'connected':
      clientId.value = message.data?.clientId
      break
    case 'joined':
      handleJoined(message.data as JoinedPayload)
      break
    case 'participants':
      if (message.data?.participants) updateParticipants(message.data.participants)
      if (typeof message.data?.locked === 'boolean') isRoomLocked.value = message.data.locked
      break
    case 'transport-created':
      handleTransportCreated(message.data as TransportPayload)
      break
    case 'transport-connected':
      handleTransportConnected(message.data?.transportId)
      break
    case 'produced':
      handleProduced(message.data?.producerId)
      break
    case 'new-producer':
      if (message.data?.peerId !== clientId.value) consumeProducer(message.data.producerId, message.data.peerId)
      break
    case 'consumed':
      handleConsumed(message.data as ConsumedPayload)
      break
    case 'room-locked':
      isRoomLocked.value = message.data?.locked
      break
    case 'peer-updated':
      participants.value = participants.value.map(peer => {
        if (peer.id !== message.data?.peerId) return peer
        return {
          ...peer,
          muted: typeof message.data?.muted === 'boolean' ? message.data.muted : peer.muted,
        }
      })
      break
    case 'host-changed':
      participants.value = participants.value.map(peer => ({ ...peer, isHost: peer.id === message.data?.hostId }))
      break
    case 'kicked':
      toast.error('Oda yöneticisi tarafından çıkarıldınız')
      resetRoomState()
      break
    case 'error':
      toast.error(message.data?.message || 'Ses servisi hatası')
      joinLoading.value = false
      break
    default:
      break
  }
}

onMounted(async () => {
  try {
    await connectSocket()
  } catch (error) {
    console.error('Voice socket connection failed', error)
  }
  window.addEventListener('beforeunload', leaveRoom)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', leaveRoom)
  leaveRoom()
  wsRef.value?.close()
})
</script>

<style scoped>
@reference 'tailwindcss';
.form-label {
  @apply block text-sm font-medium text-slate-600 mb-1;
}

.form-input {
  @apply w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200;
}

.primary-btn {
  @apply inline-flex items-center justify-center px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed;
}

.secondary-btn {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed;
}

.status-pill {
  @apply inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide;
}
</style>
