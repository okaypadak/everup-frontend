import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()
    const id = event.context.params?.id

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/notifications/${id}/read`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response
    } catch (err: any) {
        console.error('Bildirim okundu işaretlenemedi:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Sunucu hatası',
        }
    }
})
