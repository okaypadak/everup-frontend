import { defineEventHandler, getRouterParam, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()

    // ⛔️ Token kontrolü
    if (!token) {
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    try {
        // 🗑 NestJS API'ye DELETE isteği gönder
        const result = await ofetch(`${config.apiBaseUrl}/documents/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        // ✅ Başarılı yanıtı döndür
        return result
    } catch (err: any) {
        console.error('❌ Döküman silinemedi:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Silme işlemi sırasında sunucu hatası oluştu'
        }
    }
})
