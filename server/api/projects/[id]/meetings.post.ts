import { defineEventHandler, getCookie, getRouterParam, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'everup_auth_token')
    const projectId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!token) {
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    if (!projectId) {
        return {
            statusCode: 400,
            message: 'Geçersiz proje ID'
        }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/projects/${projectId}/meetings`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body
        })

        return response
    } catch (err: any) {
        console.error(`Proje toplantısı oluşturulamadı (ID: ${projectId}):`, err)

        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
