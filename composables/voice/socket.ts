/* eslint-disable no-console */
export interface VoiceSocketEvent<T = unknown> {
  event: string
  data?: T
  id?: string
}

export interface VoiceSocket {
  connect: () => Promise<void>
  disconnect: () => void
  request: <T = unknown>(event: string, payload?: unknown) => Promise<T>
  emit: (event: string, payload?: unknown) => void
  on: (event: string, handler: (payload: any) => void) => void
  off: (event: string, handler: (payload: any) => void) => void
  isConnected: () => boolean
}

interface PendingRequest {
  resolve: (payload: any) => void
  reject: (error: any) => void
  timeout: ReturnType<typeof setTimeout>
}

const ACK_TIMEOUT = 10_000

export const createVoiceSocket = (url: string): VoiceSocket => {
  if (typeof window === 'undefined') {
    throw new Error('Voice socket can only be created in the browser context')
  }

  let socket: WebSocket | null = null
  const listeners = new Map<string, Set<(payload: any) => void>>()
  const pending = new Map<string, PendingRequest>()
  let connected = false

  const notify = (event: string, payload: any) => {
    const handlers = listeners.get(event)
    handlers?.forEach((handler) => handler(payload))
  }

  const connect = () =>
    new Promise<void>((resolve, reject) => {
      socket = new WebSocket(url)

      socket.addEventListener('open', () => {
        connected = true
        resolve()
      })

      socket.addEventListener('error', (error) => {
        console.error('[voice] socket error', error)
        reject(error)
      })

      socket.addEventListener('close', () => {
        connected = false
        pending.forEach(({ reject, timeout }) => {
          clearTimeout(timeout)
          reject(new Error('Socket connection closed'))
        })
        pending.clear()
        listeners.clear()
      })

      socket.addEventListener('message', (event) => {
        try {
          const payload: VoiceSocketEvent & { replyTo?: string; error?: any } = JSON.parse(event.data)
          if (payload.replyTo) {
            const pendingRequest = pending.get(payload.replyTo)
            if (pendingRequest) {
              clearTimeout(pendingRequest.timeout)
              pendingRequest[payload.error ? 'reject' : 'resolve'](payload.error ?? payload.data)
              pending.delete(payload.replyTo)
            }
            return
          }
          notify(payload.event, payload.data)
        } catch (error) {
          console.warn('[voice] failed to parse socket message', error)
        }
      })
    })

  const disconnect = () => {
    socket?.close()
    socket = null
    connected = false
  }

  const emit = (event: string, data?: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    const payload: VoiceSocketEvent = { event, data }
    socket.send(JSON.stringify(payload))
  }

  const request = <T = unknown>(event: string, data?: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Socket is not connected'))
    }
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    const payload: VoiceSocketEvent = { id, event, data }
    socket.send(JSON.stringify(payload))

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`Request timeout for event ${event}`))
      }, ACK_TIMEOUT)

      pending.set(id, { resolve, reject, timeout })
    })
  }

  const on = (event: string, handler: (payload: any) => void) => {
    const handlers = listeners.get(event) ?? new Set<(payload: any) => void>()
    handlers.add(handler)
    listeners.set(event, handlers)
  }

  const off = (event: string, handler: (payload: any) => void) => {
    const handlers = listeners.get(event)
    handlers?.delete(handler)
    if (handlers && handlers.size === 0) {
      listeners.delete(event)
    }
  }

  const isConnected = () => connected

  return {
    connect,
    disconnect,
    request,
    emit,
    on,
    off,
    isConnected,
  }
}
