import { defineEventHandler, getCookie, getQuery } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    const q = getQuery(event)
    const projectId = Number(q.projectId)

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }
    if (!projectId || Number.isNaN(projectId)) {
        return { statusCode: 400, message: 'Geçersiz projectId' }
    }

    try {
        const resp = await ofetch(`${config.apiBaseUrl}/sprints/active/${projectId}/throughput`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        })
        return resp
    } catch (err: any) {
        console.error('[API throughput] hata:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası',
        }
    }
})
