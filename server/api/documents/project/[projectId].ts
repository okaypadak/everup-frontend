// /server/api/documents/project/[projectId].ts
import { defineEventHandler, getRouterParam, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const projectId = getRouterParam(event, 'projectId')
    const token = getCookie(event, 'everup_auth_token')
    const config = useRuntimeConfig()

    if (!token) {
        return { statusCode: 401, message: 'Giriş yapmanız gerekiyor.' }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/documents/project/${projectId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response
    } catch (err: any) {
        console.error('Döküman getirme hatası:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Dökümanlar alınamadı'
        }
    }
})
