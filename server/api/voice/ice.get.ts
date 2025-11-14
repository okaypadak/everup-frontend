import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { ofetch } from 'ofetch'

type IceServerResponse = {
  iceServers: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
  }>;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const uid = typeof query.uid === 'string' ? query.uid : undefined

  try {
    const response = await ofetch<IceServerResponse>(`${config.apiBaseUrl}/voice/ice`, {
      method: 'GET',
      query: uid ? { uid } : undefined,
    })
    return response
  } catch (error: any) {
    console.error('Ses servisi ICE sunucuları alınamadı:', error)
    const statusCode = error?.response?.status ?? 500
    setResponseStatus(event, statusCode)
    return { iceServers: [] }
  }
})
