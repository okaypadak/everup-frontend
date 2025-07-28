import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const users = await ofetch(`${config.apiBaseUrl}/users`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        return users
    } catch (err: any) {
        console.error('Kullanıcıları alma hatası:', err)
        return { statusCode: err.response?.status || 500, message: 'Sunucu hatası' }
    }
})
