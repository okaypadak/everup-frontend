// /server/api/documents/[id].ts
import { defineEventHandler, getRouterParam, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        await ofetch(`${config.apiBaseUrl}/documents/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return { deleted: true }
    } catch (err: any) {
        console.error('Döküman silinemedi:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Silme işlemi başarısız oldu'
        }
    }
})
