import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // 🍪 httpOnly çerezden token'ı al
    const token = getCookie(event, 'auth_token')

    if (!token) {
        console.warn('[API /tasks] Token bulunamadı, yetkisiz erişim')
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/tasks`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response
    } catch (err: any) {
        console.error('Dönemler alınamadı:', err)

        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
