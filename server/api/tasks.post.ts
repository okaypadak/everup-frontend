import { defineEventHandler, readBody, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')

    if (!token) {
        console.warn('[API /tasks POST] Token bulunamadı')
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    try {
        const body = await readBody(event)
        console.log('[API /tasks POST] Gönderilen body:', body)

        const response = await ofetch(`${config.apiBaseUrl}/tasks`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body
        })

        console.log('[API /tasks POST] Backend response:', response)
        return response
    } catch (err: any) {
        console.error('[API /tasks POST] Hata:', err)
        console.error('[API /tasks POST] Backend response:', err?.response?._data || err.data || 'Yok')
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
