import { defineEventHandler, getCookie, readRawBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'everup_auth_token')
    const config = useRuntimeConfig()
    const raw = await readRawBody(event, 'utf8') // ham JSON string

    if (!raw || !raw.trim()) {
        event.node.res.statusCode = 400
        return { statusCode: 400, message: 'Boş body' }
    }

    // (İsteğe bağlı) kökün dizi olduğunu hızlıca doğrula
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) {
            event.node.res.statusCode = 400
            return { statusCode: 400, message: 'Kök JSON bir DİZİ olmalı: [ {...}, {...} ]' }
        }
    } catch (e: any) {
        event.node.res.statusCode = 400
        return { statusCode: 400, message: 'Geçersiz JSON: ' + e.message }
    }

    return ofetch(`${config.apiBaseUrl}/tasks/bulk`, {
        method: 'POST',
        body: raw,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
})
