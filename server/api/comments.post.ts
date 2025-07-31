// server/api/comments.post.ts

import { defineEventHandler, readBody, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')

    if (!token) {
        console.warn('[API /comments] Token bulunamadı, yetkisiz erişim')
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    const payload = await readBody(event)

    try {
        const response = await ofetch(`${config.apiBaseUrl}/comments`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: payload
        })

        return response
    } catch (err: any) {
        console.error('Yorum gönderilemedi:', err)

        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
