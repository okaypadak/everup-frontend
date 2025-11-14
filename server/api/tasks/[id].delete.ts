// server/api/tasks/[id].delete.ts
import { defineEventHandler, getCookie, createError } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'everup_auth_token')
    const idParam = event.context.params?.id
    const id = Number(idParam)
    const config = useRuntimeConfig()

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Giriş gerekli' })
    }

    if (!id || Number.isNaN(id)) {
        throw createError({ statusCode: 400, statusMessage: 'Geçersiz görev ID' })
    }

    try {
        // Nest tarafında @Delete(':id') -> /tasks/:id
        const url = `${config.apiBaseUrl}/tasks/${id}`

        // Beklenen yanıt: { success: true, message: 'Task silindi' }
        const res = await ofetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                // İsteğe bağlı: backend CORS/CSRF kısıtları yoksa yeterli
                'Content-Type': 'application/json',
            },
        })

        // Backend ne döndürüyorsa aynen geçir
        return res
    } catch (err: any) {
        const status = err?.response?.status || 500
        const message =
            err?.data?.message ||
            err?.response?._data?.message ||
            'Görev silinemedi'

        // Hata formatını tutarlı ver
        throw createError({
            statusCode: status,
            statusMessage: message,
            data: { message },
        })
    }
})
