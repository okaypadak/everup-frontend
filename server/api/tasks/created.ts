import { defineEventHandler, getCookie } from 'h3'
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

    try {
        const tasks = await ofetch(`${config.apiBaseUrl}/tasks/created`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return tasks
    } catch (error: any) {
        console.error('Kullanıcının oluşturduğu görevler alınırken hata:', error)
        return {
            statusCode: error.response?.status || 500,
            message: 'Görevler alınamadı',
        }
    }
})