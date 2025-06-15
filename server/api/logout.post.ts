import { defineEventHandler, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
    // 🍪 auth_token çerezini sil
    setCookie(event, 'auth_token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 0
    })

    return {
        statusCode: 200,
        message: 'Çıkış başarılı'
    }
})
