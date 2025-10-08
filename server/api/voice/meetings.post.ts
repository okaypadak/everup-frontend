import { defineEventHandler, readBody, getCookie } from 'h3'
import { ofetch } from 'ofetch'

interface CreateMeetingResponse {
  meetingId?: string
  id?: string
  roomId?: string
  signalingUrl?: string
  meeting?: {
    meetingId?: string
    id?: string
    roomId?: string
    signalingUrl?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

const normalizeMeetingId = (payload: CreateMeetingResponse | null | undefined) => {
  if (!payload) return ''
  const directId = payload.meetingId || payload.id || payload.roomId
  if (typeof directId === 'string' && directId.trim().length > 0) {
    return directId.trim()
  }

  const nested = payload.meeting
  if (nested && typeof nested === 'object') {
    const nestedId = nested.meetingId || nested.id || nested.roomId
    if (typeof nestedId === 'string' && nestedId.trim().length > 0) {
      return nestedId.trim()
    }
  }

  return ''
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth_token')

  if (!token) {
    return {
      statusCode: 401,
      message: 'Giriş yapmanız gerekiyor.',
    }
  }

  try {
    const body = await readBody(event)
    const response = await ofetch<CreateMeetingResponse>(`${config.apiBaseUrl}/voice/meetings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    })

    const meetingId = normalizeMeetingId(response)
    if (!meetingId) {
      return {
        statusCode: 502,
        message: 'Toplantı kimliği alınamadı.',
      }
    }

    return {
      meetingId,
      signalingUrl: response?.signalingUrl ?? response?.meeting?.signalingUrl ?? null,
    }
  } catch (err: any) {
    console.error('[API /voice/meetings POST] Hata:', err)
    console.error('[API /voice/meetings POST] Backend response:', err?.response?._data || err.data || 'Yok')
    return {
      statusCode: err.response?.status || 500,
      message: err.data?.message || 'Sunucu hatası',
    }
  }
})
