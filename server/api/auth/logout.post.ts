import { defineEventHandler, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
    // 🍪 everup_auth_token çerezini sil
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 0
    }

    setCookie(event, 'everup_auth_token', '', options)

    return {
        statusCode: 200,
        message: 'Çıkış başarılı'
    }
})
