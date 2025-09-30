import { defineStore } from 'pinia'

export interface VoiceParticipant {
  id: string
  username: string
  stream: MediaStream | null
  muted: boolean
}

interface IdentityPayload {
  roomId: string
  username: string
}

interface ParticipantUpdatePayload {
  id: string
  username: string
  muted?: boolean
  stream?: MediaStream | null
}

export const useVoiceStore = defineStore('voice', {
  state: () => ({
    identity: { roomId: '', username: '' } as IdentityPayload,
    localStream: null as MediaStream | null,
    localMuted: false,
    participants: {} as Record<string, VoiceParticipant>,
    joined: false,
  }),
  getters: {
    roomId: (state) => state.identity.roomId,
    username: (state) => state.identity.username,
    remoteParticipants: (state) => Object.values(state.participants),
  },
  actions: {
    setIdentity(payload: IdentityPayload) {
      this.identity = payload
    },
    setLocalStream(stream: MediaStream | null) {
      this.localStream = stream
    },
    setLocalMuted(muted: boolean) {
      this.localMuted = muted
    },
    markJoined(joined: boolean) {
      this.joined = joined
    },
    upsertParticipant(payload: ParticipantUpdatePayload) {
      const existing = this.participants[payload.id]
      if (existing) {
        this.participants[payload.id] = {
          ...existing,
          username: payload.username ?? existing.username,
          stream: payload.stream ?? existing.stream,
          muted: payload.muted ?? existing.muted,
        }
      } else {
        this.participants[payload.id] = {
          id: payload.id,
          username: payload.username,
          stream: payload.stream ?? null,
          muted: payload.muted ?? false,
        }
      }
    },
    removeParticipant(participantId: string) {
      delete this.participants[participantId]
    },
    setParticipantStream(participantId: string, stream: MediaStream | null) {
      const participant = this.participants[participantId]
      if (!participant) return
      this.participants[participantId] = {
        ...participant,
        stream,
      }
    },
    setParticipantMuted(participantId: string, muted: boolean) {
      const participant = this.participants[participantId]
      if (!participant) return
      this.participants[participantId] = {
        ...participant,
        muted,
      }
    },
    reset() {
      Object.values(this.participants).forEach((participant) => {
        participant.stream?.getTracks().forEach((track) => track.stop())
      })
      this.participants = {}
      this.localStream?.getTracks().forEach((track) => track.stop())
      this.localStream = null
      this.localMuted = false
      this.identity = { roomId: '', username: '' }
      this.joined = false
    },
  },
})
