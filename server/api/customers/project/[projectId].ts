import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()
    const projectId = event.context.params?.projectId

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const customers = await ofetch(`${config.apiBaseUrl}/customers/project/${projectId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return customers
    } catch (err: any) {
        console.error('Müşteri getirme hatası:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Sunucu hatası',
        }
    }
})
