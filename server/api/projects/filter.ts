import { defineEventHandler, getCookie, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()
    const projectId = event.context.params?.projectId

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const body = await readBody(event)

        const response = await ofetch(`${config.apiBaseUrl}/tasks/project/${projectId}/filter`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body,
        })

        return response
    } catch (err: any) {
        console.error('Görev filtreleme hatası:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Sunucu hatası',
        }
    }
})
