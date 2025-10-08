import type { IncomingMessage } from 'node:http'
import { randomUUID } from 'node:crypto'
import { defineNitroPlugin } from '#internal/nitro'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'

type IceCandidatePayload = {
  candidate: string
  sdpMid?: string | null
  sdpMLineIndex?: number | null
}

type VoiceSignal =
  | { type: 'join'; roomId: string; username: string }
  | { type: 'leave' }
  | { type: 'offer'; targetId: string; sdp: string }
  | { type: 'answer'; targetId: string; sdp: string }
  | { type: 'ice-candidate'; targetId: string; candidate: IceCandidatePayload }
  | { type: 'set-mute'; muted: boolean }

type VoiceServerMessage =
  | {
      type: 'joined'
      id: string
      participants: Array<{ id: string; username: string; muted: boolean }>
    }
  | {
      type: 'participant-joined'
      participant: { id: string; username: string; muted: boolean }
    }
  | { type: 'participant-left'; id: string }
  | { type: 'participant-muted'; id: string; muted: boolean }
  | { type: 'offer'; fromId: string; sdp: string; username: string }
  | { type: 'answer'; fromId: string; sdp: string; username: string }
  | { type: 'ice-candidate'; fromId: string; candidate: IceCandidatePayload }
  | { type: 'error'; message: string }

interface VoiceClient {
  id: string
  username: string
  roomId: string
  muted: boolean
  socket: WebSocket
}

const rooms = new Map<string, Map<string, VoiceClient>>()

const getOrCreateRoom = (roomId: string) => {
  const existing = rooms.get(roomId)
  if (existing) return existing
  const room = new Map<string, VoiceClient>()
  rooms.set(roomId, room)
  return room
}

const removeClientFromRoom = (client: VoiceClient) => {
  const room = rooms.get(client.roomId)
  if (!room) return
  room.delete(client.id)
  if (room.size === 0) {
    rooms.delete(client.roomId)
  }
}

const broadcast = (room: Map<string, VoiceClient>, message: VoiceServerMessage, excludeId?: string) => {
  const payload = JSON.stringify(message)
  room.forEach((client) => {
    if (excludeId && client.id === excludeId) return
    if (client.socket.readyState === client.socket.OPEN) {
      client.socket.send(payload)
    }
  })
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('listen', (listener) => {
    if (!listener.server) return

    const wss = new WebSocketServer({ noServer: true })

    const handleUpgrade = (request: IncomingMessage, socket: any, head: Buffer) => {
      const url = request.url || ''
      if (!url.startsWith('/voice')) {
        return
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
      })
    }

    listener.server.on('upgrade', handleUpgrade)

    wss.on('connection', (socket) => {
      let client: VoiceClient | null = null

      const send = (message: VoiceServerMessage) => {
        if (socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify(message))
        }
      }

      const cleanup = () => {
        if (!client) return
        const room = rooms.get(client.roomId)
        if (!room) {
          client = null
          return
        }
        removeClientFromRoom(client)
        broadcast(room, { type: 'participant-left', id: client.id })
        client = null
      }

      socket.on('message', (raw) => {
        let message: VoiceSignal
        try {
          message = JSON.parse(raw.toString()) as VoiceSignal
        } catch {
          send({ type: 'error', message: 'Geçersiz mesaj biçimi' })
          return
        }

        if (message.type === 'join') {
          if (client) return
          if (!message.roomId || !message.username) {
            send({ type: 'error', message: 'Oda veya kullanıcı bilgisi eksik' })
            return
          }
          const room = getOrCreateRoom(message.roomId)
          const clientId = randomUUID()
          client = {
            id: clientId,
            roomId: message.roomId,
            username: message.username,
            muted: false,
            socket,
          }
          room.set(clientId, client)

          const participants = Array.from(room.values())
            .filter((participant) => participant.id !== clientId)
            .map(({ id, username, muted }) => ({ id, username, muted }))

          send({ type: 'joined', id: clientId, participants })
          broadcast(room, {
            type: 'participant-joined',
            participant: { id: clientId, username: client.username, muted: client.muted },
          }, clientId)
          return
        }

        if (!client) {
          send({ type: 'error', message: 'Önce odaya katılmalısınız' })
          return
        }

        const room = rooms.get(client.roomId)
        if (!room) return

        switch (message.type) {
          case 'leave': {
            cleanup()
            break
          }
          case 'offer':
          case 'answer':
          case 'ice-candidate': {
            const target = room.get(message.targetId)
            if (!target) return
            const payload: VoiceServerMessage = {
              type: message.type,
              fromId: client.id,
              ...(message.type !== 'ice-candidate' ? { sdp: message.sdp } : { candidate: message.candidate }),
            } as VoiceServerMessage
            if (message.type !== 'ice-candidate') {
              ;(payload as any).username = client.username
            }
            if (target.socket.readyState === target.socket.OPEN) {
              target.socket.send(JSON.stringify(payload))
            }
            break
          }
          case 'set-mute': {
            client.muted = !!message.muted
            broadcast(room, { type: 'participant-muted', id: client.id, muted: client.muted }, client.id)
            break
          }
        }
      })

      socket.on('close', () => {
        cleanup()
      })

      socket.on('error', () => {
        cleanup()
      })
    })
  })
})
