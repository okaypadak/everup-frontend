// Nuxt 3 server API endpoint: PATCH /api/documents/:id

import { defineEventHandler, getRouterParam, getCookie, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const token = getCookie(event, 'everup_auth_token')
    const config = useRuntimeConfig()

    // ⛔️ Token kontrolü
    if (!token) {
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    // 📥 İstekten gelen gövde verisi (güncelleme içeriği)
    const body = await readBody(event)

    // 🚀 NestJS backend'e PATCH isteği gönder
    try {
        const updatedDocument = await ofetch(`${config.apiBaseUrl}/documents/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body
        })

        // ✅ Başarılı yanıt
        return updatedDocument
    } catch (err: any) {
        console.error('❌ Döküman güncellenemedi:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Güncelleme sırasında sunucu hatası oluştu'
        }
    }
})
