import { defineEventHandler, getCookie, getQuery } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const { apiBaseUrl } = useRuntimeConfig()
    const token = getCookie(event, 'everup_auth_token')
    const q = getQuery(event)

    const projectId = Number(q.projectId)
    const limit = q.limit ? Number(q.limit) : 6
    const type = q.type === 'points' ? 'points' : 'count'

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }
    if (!projectId || Number.isNaN(projectId)) {
        return { statusCode: 400, message: 'Geçersiz projectId' }
    }

    // Backend: GET /sprints/velocity/:projectId/:limit/:type
    const url = `${apiBaseUrl}/sprints/velocity/${projectId}/${limit}/${type}`

    try {
        return await ofetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        })
    } catch (err: any) {
        console.error('[API velocity] hata:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası',
        }
    }
})
