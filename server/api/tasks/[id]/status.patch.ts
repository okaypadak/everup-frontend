import { defineEventHandler, getCookie, readBody, getRouterParam } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')

    if (!token) {
        console.warn('[API /tasks/:id/status] Token bulunamadı')
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    const taskId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!body?.status) {
        return {
            statusCode: 400,
            message: 'Durum alanı zorunludur.'
        }
    }

    try {
        const result = await ofetch(`${config.apiBaseUrl}/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body
        })

        return result
    } catch (err: any) {
        console.error('Durum güncellenemedi:', err)

        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
