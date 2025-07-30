import { defineEventHandler, getRouterParam, readBody, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    const projectId = getRouterParam(event, 'projectId')
    const body = await readBody(event)

    try {
        const tasks = await ofetch(`${config.apiBaseUrl}/tasks/project/${projectId}/filter`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body,
        })

        return tasks
    } catch (error: any) {
        console.error('Task filtreleme hatası:', error)
        return {
            statusCode: error.response?.status || 500,
            message: 'Görev filtreleme sırasında bir hata oluştu',
        }
    }
})
