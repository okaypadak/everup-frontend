// /server/api/documents/index.ts
import { defineEventHandler, readBody, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const body = await readBody(event)
    const config = useRuntimeConfig()

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/documents`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body
        })

        return response
    } catch (err: any) {
        console.error('Döküman oluşturulamadı:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Döküman oluşturulurken hata oluştu'
        }
    }
})
