import { defineEventHandler, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'everup_auth_token')
    const id = event.context.params?.id

    if (!token) {
        console.warn('[API /tasks/detail/:id GET] Token bulunamadı')
        return {
            statusCode: 401,
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    if (!id) {
        return {
            statusCode: 400,
            message: 'Görev ID bilgisi eksik.'
        }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/tasks/detail/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response
    } catch (err: any) {
        console.error('[API /tasks/detail/:id GET] Hata:', err)
        console.error('[API /tasks/detail/:id GET] Backend response:', err?.response?._data || err.data || 'Yok')

        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
