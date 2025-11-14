import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'everup_auth_token')

    if (!token) {
        console.warn('[API /tasks/project/:id] Token bulunamadı, yetkisiz erişim')
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    const projectId = event.context.params?.id

    try {
        const response = await ofetch(`${config.apiBaseUrl}/tasks/project/${projectId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response
    } catch (err: any) {
        console.error('Proje görevleri alınamadı:', err)

        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
