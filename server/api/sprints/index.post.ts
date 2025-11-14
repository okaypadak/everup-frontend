import { defineEventHandler, getCookie, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'everup_auth_token')
    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    const body = await readBody(event)
    // Basit runtime doğrulama
    if (!body?.projectId || !body?.name || !body?.startDate || !body?.endDate) {
        return { statusCode: 400, message: 'projectId, name, startDate, endDate zorunludur.' }
    }

    try {
        const res = await ofetch(`${config.apiBaseUrl}/sprints`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: {
                projectId: Number(body.projectId),
                name: String(body.name),
                startDate: String(body.startDate),
                endDate: String(body.endDate),
                goal: body.goal ? String(body.goal) : undefined
            }
        })
        return res
    } catch (err: any) {
        console.error('[api/sprints POST] Hata:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
