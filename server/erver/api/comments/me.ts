// server/api/comments/me.ts
import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const comments = await ofetch(`${config.apiBaseUrl}/comments/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return comments
    } catch (err: any) {
        console.error('Kendi yorumlar alınırken hata:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Sunucu hatası',
        }
    }
})
