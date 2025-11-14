import { defineEventHandler, readBody, getCookie, H3Event } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const token = getCookie(event, 'everup_auth_token')
    const config = useRuntimeConfig()
    const body = await readBody(event)

    if (!token) {
        return {
            code: '401',
            message: 'Giriş yapmanız gerekiyor.'
        }
    }

    try {
        const response = await ofetch(`${config.apiBaseUrl}/users/register`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body
        })

        return response // örn: { message: 'İşlem başarılı', code: '00' }
    } catch (err: any) {
        console.error('❌ Kullanıcı API hatası:', err)

        return {
            code: err.response?.status?.toString() || '500',
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
