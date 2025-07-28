import { defineEventHandler, readBody, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()
    const body = await readBody(event)

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const customer = await ofetch(`${config.apiBaseUrl}/customers`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body,
        })

        return customer
    } catch (err: any) {
        console.error('Müşteri API hatası:', err)
        return { statusCode: err.response?.status || 500, message: 'Sunucu hatası' }
    }
})
