import { defineEventHandler, readBody, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()
    const body = await readBody(event)

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/projects`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body,
        })

        return response // Beklenen: { message: '...', code: '00' }
    } catch (err: any) {
        console.error('Proje API hatası:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası',
        }
    }
})
