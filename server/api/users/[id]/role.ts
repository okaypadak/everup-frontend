// server/api/users/[id]/role.ts
import { defineEventHandler, readBody, getRouterParam, getCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'id')
    const token = getCookie(event, 'auth_token')
    const body = await readBody(event)

    if (!token) {
        return { statusCode: 401, message: 'Yetkisiz' }
    }

    try {
        await ofetch(`${useRuntimeConfig().apiBaseUrl}/users/${userId}/role`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
            body
        })

        return { message: 'Rol güncellendi' }
    } catch (err: any) {
        console.error('Hata:', err)
        return { statusCode: err.response?.status || 500, message: 'Sunucu hatası' }
    }
})
