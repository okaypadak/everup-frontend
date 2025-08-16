import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    const { sprintId } = event.context.params as { sprintId: string }

    if (!token) return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }

    try {
        return await ofetch(`${config.apiBaseUrl}/sprints/${sprintId}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
        })
    } catch (err: any) {
        console.error('[api/sprints/:id/tasks] hata:', err)
        return { statusCode: err.response?.status || 500, message: err.data?.message || 'Sunucu hatası' }
    }
})
