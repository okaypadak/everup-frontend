// /server/api/documents/[id].ts
import { defineEventHandler, getRouterParam, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()

    if (!token) {
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    try {
        const document = await ofetch(`${config.apiBaseUrl}/documents/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return document
    } catch (err: any) {
        console.error('Döküman alınamadı:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Döküman getirme işlemi başarısız oldu'
        }
    }
})
