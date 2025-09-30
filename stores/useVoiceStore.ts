import { computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

export interface VoiceParticipant {
    id: string
    name: string
    stream?: MediaStream
    isMuted: boolean
    isSpeaking?: boolean
    joinedAt?: string
    metadata?: Record<string, unknown>
}

export interface VoiceTransports {
    send?: unknown
    receive?: unknown
    producer?: unknown
    consumer?: unknown
}

export type VoiceSocket = unknown

interface VoiceState {
    participants: VoiceParticipant[]
    localStream: MediaStream | null
    joinedRoom: boolean
    isMuted: boolean
    transports: VoiceTransports
    socket: VoiceSocket | null
}

export const useVoiceStore = defineStore('voice', {
    state: (): VoiceState => ({
        participants: [],
        localStream: null,
        joinedRoom: false,
        isMuted: false,
        transports: {},
        socket: null
    }),
    getters: {
        activeParticipants: (state) => state.participants.filter((participant) => !participant.isMuted),
        participantCount: (state) => state.participants.length,
        isConnected: (state) => state.joinedRoom && !!state.socket
    },
    actions: {
        setLocalStream(stream: MediaStream | null) {
            this.localStream = stream
        },
        setSocket(socket: VoiceSocket | null) {
            this.socket = socket
        },
        setTransports(transports: Partial<VoiceTransports>) {
            this.transports = {
                ...this.transports,
                ...transports
            }
        },
        clearTransports() {
            this.transports = {}
        },
        addParticipant(participant: VoiceParticipant) {
            const existingIndex = this.participants.findIndex((item) => item.id === participant.id)
            if (existingIndex !== -1) {
                this.participants.splice(existingIndex, 1, {
                    ...this.participants[existingIndex],
                    ...participant
                })
                return
            }

            this.participants.push(participant)
        },
        updateParticipant(id: string, updates: Partial<VoiceParticipant>) {
            const index = this.participants.findIndex((participant) => participant.id === id)
            if (index === -1) {
                return
            }

            this.participants.splice(index, 1, {
                ...this.participants[index],
                ...updates
            })
        },
        removeParticipant(id: string) {
            this.participants = this.participants.filter((participant) => participant.id !== id)
        },
        markJoined() {
            this.joinedRoom = true
        },
        markLeft() {
            this.joinedRoom = false
            this.participants = []
            this.localStream = null
            this.isMuted = false
            this.clearTransports()
            this.socket = null
        },
        toggleMute(force?: boolean) {
            if (typeof force === 'boolean') {
                this.isMuted = force
            } else {
                this.isMuted = !this.isMuted
            }

            if (this.localStream) {
                this.localStream.getAudioTracks().forEach((track) => {
                    track.enabled = !this.isMuted
                })
            }
        }
    }
})

export type VoiceStore = ReturnType<typeof useVoiceStore>

export function useVoiceStoreRefs() {
    const voiceStore = useVoiceStore()
    const refs = storeToRefs(voiceStore)

    const speakingParticipants = computed(() =>
        refs.participants.value.filter((participant) => participant.isSpeaking)
    )

    return {
        voiceStore,
        ...refs,
        speakingParticipants
    }
}
