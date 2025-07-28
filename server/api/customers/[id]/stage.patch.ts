import { defineEventHandler, readBody, getRouterParam, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const customerId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const config = useRuntimeConfig()

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    if (!body.marketingStatus) {
        return { statusCode: 400, message: 'Geçerli bir durum (marketingStatus) gönderilmedi.' }
    }

    try {
        const result = await ofetch(`${config.apiBaseUrl}/customers/${customerId}/stage`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body,
        })

        return result
    } catch (err: any) {
        console.error('Durum güncelleme hatası:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.response?._data?.message || 'Sunucu hatası',
        }
    }
})
