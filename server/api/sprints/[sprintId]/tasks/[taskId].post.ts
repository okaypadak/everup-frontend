import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'everup_auth_token')
    const { sprintId, taskId } = event.context.params as { sprintId: string, taskId: string }

    if (!token) return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }

    try {
        return await ofetch(`${config.apiBaseUrl}/sprints/${sprintId}/tasks/${taskId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        })
    } catch (err: any) {
        console.error('[api/sprints/:sid/tasks/:tid POST] hata:', err)
        return { statusCode: err.response?.status || 500, message: err.data?.message || 'Sunucu hatası' }
    }
})
