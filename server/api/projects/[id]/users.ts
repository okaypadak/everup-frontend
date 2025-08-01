import { defineEventHandler, getCookie, getRouterParam } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    const projectId = getRouterParam(event, 'id')

    if (!token) {
        console.warn(`[API /projects/${projectId}/users] Token eksik`)
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
        const response = await ofetch(`${config.apiBaseUrl}/projects/${projectId}/users`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response
    } catch (err: any) {
        console.error(`Proje üyeleri alınamadı (ID: ${projectId}):`, err)

        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
