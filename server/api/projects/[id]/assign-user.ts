import { defineEventHandler, getCookie, getRouterParam, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'everup_auth_token')
    const config = useRuntimeConfig()
    const projectId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/projects/${projectId}/assign-user`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body
        })

        return response
    } catch (err: any) {
        console.error('Kullanıcı atama hatası:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
