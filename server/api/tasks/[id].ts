// server/api/tasks/[id].ts
import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')

    if (!token) {
        console.warn('[API /tasks/:id] Token bulunamadı')
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    const projectId = event.context.params?.id
    if (!projectId) {
        return { statusCode: 400, message: 'Proje ID eksik' }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/tasks/${projectId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response
    } catch (err: any) {
        console.error('Görevler alınamadı:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
