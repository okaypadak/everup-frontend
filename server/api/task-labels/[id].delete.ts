import { defineEventHandler, getCookie, getRouterParam } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'everup_auth_token')
    const labelId = getRouterParam(event, 'id')

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    if (!labelId) {
        return { statusCode: 400, message: 'Geçersiz veri: label ID gereklidir.' }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/task-labels/${labelId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response
    } catch (err: any) {
        console.error('Etiket silinemedi:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Etiket silinirken hata oluştu'
        }
    }
})