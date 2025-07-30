import {defineEventHandler, getCookie, getRouterParam} from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    const projectId = getRouterParam(event, 'id')
    console.log('Project ID:', projectId)
    if (!token) {
        return { statusCode: 401, message: 'Yetkisiz erişim' }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/task-labels/${projectId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log("aha "+response)
        return response
    } catch (err: any) {
        console.error('Etiketler alınamadı:', err)
        return {
            statusCode: err.response?.status || 500,
            message: 'Etiketler alınırken hata oluştu'
        }
    }
})
