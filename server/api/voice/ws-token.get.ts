import { defineEventHandler, getCookie, setResponseStatus } from 'h3'
import { ofetch } from 'ofetch'

type VoiceTokenResponse = {
  token: string
  expiresIn?: number
}

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'everup_auth_token')
  if (!authCookie) {
    setResponseStatus(event, 401)
    return { message: 'Giriş yapmanız gerekiyor' }
  }

  const config = useRuntimeConfig()

  try {
    const response = await ofetch<VoiceTokenResponse>(`${config.apiBaseUrl}/voice/ws-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authCookie}`,
      },
    })
    return response
  } catch (error: any) {
    console.error('Ses servisi token isteği başarısız oldu:', error)
    const statusCode = error?.response?.status ?? 500
    setResponseStatus(event, statusCode)
    const fallbackMessage = statusCode === 401
      ? 'Oturumunuzun süresi dolmuş görünüyor.'
      : 'Ses servisine erişim izni alınamadı.'

    return {
      message: error?.response?._data?.message || fallbackMessage,
    }
  }
})
