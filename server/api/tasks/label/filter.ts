import { defineEventHandler, getCookie, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()

    if (!token) {
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.',
        }
    }

    const body = await readBody(event)
    const labelIds = body.labelIds

    try {
        const tasks = await ofetch(`${config.apiBaseUrl}/tasks/label/filter`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: {
                labelIds
            },
        })

        return tasks
    } catch (error: any) {
        console.error('Etiket filtreleme hatası:', error)
        return {
            statusCode: error.response?.status || 500,
            message: 'Görev filtreleme sırasında bir hata oluştu',
        }
    }
})