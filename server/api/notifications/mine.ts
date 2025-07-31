import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()

    if (!token) {
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.',
        }
    }

    try {
        const notifications = await ofetch(`${config.apiBaseUrl}/notifications/mine`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return notifications
    } catch (error: any) {
        console.error('Bildirimler alınırken hata:', error)
        return {
            statusCode: error.response?.status || 500,
            message: 'Bildirimler alınamadı',
        }
    }
})