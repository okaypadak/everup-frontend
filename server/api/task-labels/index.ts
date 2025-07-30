import { defineEventHandler, readBody, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    const body = await readBody(event)

    const { projectId, name } = body

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    if (!projectId || !name) {
        return { statusCode: 400, message: 'Geçersiz veri: projectId ve name gereklidir.' }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/task-labels/${projectId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: { name }
        })

        return response
    } catch (err: any) {
        console.error('Etiket oluşturulamadı:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Etiket oluşturulurken hata oluştu'
        }
    }
})
