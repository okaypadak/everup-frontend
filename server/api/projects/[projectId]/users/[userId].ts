import { defineEventHandler, getRouterParam, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'everup_auth_token')
    const config = useRuntimeConfig()
    const projectId = getRouterParam(event, 'projectId')
    const userId = getRouterParam(event, 'userId')

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        await ofetch(`${config.apiBaseUrl}/projects/${projectId}/users/${userId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        return { message: 'Kullanıcı silindi' }
    } catch (err: any) {
        console.error('Kullanıcı çıkarma hatası:', err)
        return { statusCode: err.response?.status || 500, message: 'Sunucu hatası' }
    }
})
