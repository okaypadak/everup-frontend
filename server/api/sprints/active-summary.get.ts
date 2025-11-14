import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'everup_auth_token')
    const { projectId } = getQuery(event) as { projectId?: string }

    if (!token) return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    if (!projectId) return { statusCode: 400, message: 'projectId zorunlu' }

    try {
        return await ofetch(`${config.apiBaseUrl}/sprints/active/${projectId}/summary`, {
            headers: { Authorization: `Bearer ${token}` },
        })
    } catch (err: any) {
        console.error('[api/sprints/active-summary] Hata:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
