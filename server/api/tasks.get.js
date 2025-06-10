import { defineEventHandler, getHeaders } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const headers = getHeaders(event)

    const token = headers.authorization

    try {
        return await ofetch(`${config.apiBaseUrl}/tasks`, {
            method: 'GET',
            headers: {
                Authorization: token
            }
        })
    } catch (err) {
        console.error('Dönemler alınamadı:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
