import type { VoiceSocket } from './socket'

export interface TransportOptions {
  id: string
  iceParameters?: RTCConfiguration
  dtlsParameters?: unknown
  kind?: 'audio' | 'video'
}

export interface SendTransport {
  id: string
  publish: (stream: MediaStream) => Promise<void>
  pause: (stream: MediaStream) => void
  resume: (stream: MediaStream) => void
  close: () => void
}

export interface RecvTransport {
  id: string
  stream: MediaStream
  close: () => void
}

export const createSendTransport = async (
  socket: VoiceSocket,
  options: TransportOptions,
): Promise<SendTransport> => {
  let closed = false

  const publish = async (stream: MediaStream) => {
    if (closed) return
    const payload = {
      transportId: options.id,
      kind: options.kind ?? 'audio',
      paused: false,
    }
    await socket.request('transport-produce', payload)
    stream.getTracks().forEach((track) => {
      track.enabled = true
    })
  }

  const pause = (stream: MediaStream) => {
    if (closed) return
    stream.getAudioTracks().forEach((track) => {
      track.enabled = false
    })
    stream.getVideoTracks().forEach((track) => {
      track.enabled = false
    })
    socket.emit('transport-pause', { transportId: options.id })
  }

  const resume = (stream: MediaStream) => {
    if (closed) return
    stream.getTracks().forEach((track) => {
      track.enabled = true
    })
    socket.emit('transport-resume', { transportId: options.id })
  }

  const close = () => {
    if (closed) return
    closed = true
    socket.emit('transport-close', { transportId: options.id })
  }

  return {
    id: options.id,
    publish,
    pause,
    resume,
    close,
  }
}

export const createRecvTransport = async (
  socket: VoiceSocket,
  options: TransportOptions & { participantId: string },
): Promise<RecvTransport> => {
  const stream = new MediaStream()
  await socket.request('transport-consume', {
    transportId: options.id,
    participantId: options.participantId,
  })

  return {
    id: options.id,
    stream,
    close: () => {
      stream.getTracks().forEach((track) => track.stop())
      socket.emit('transport-close', { transportId: options.id })
    },
  }
}
