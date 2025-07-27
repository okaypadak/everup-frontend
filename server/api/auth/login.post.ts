import type { H3Event } from 'h3';
import { defineEventHandler, readBody, setCookie } from 'h3'
import { ofetch } from 'ofetch'
import { jwtDecode } from 'jwt-decode'

type LoginRequestBody = {
    username: string
    password: string
}

type JwtPayload = {
    id: number
    role: string
    firstName: string
    lastName: string
    exp: number
    iat?: number
}

type LoginResponse = {
    token: string
}

type PublicUser = {
    fullName: string
}

type SuccessResponse = {
    statusCode: 200
    message: string
    user: PublicUser
}

type ErrorResponse = {
    statusCode: number
    message: string
}

export default defineEventHandler(async (event: H3Event): Promise<SuccessResponse | ErrorResponse> => {
    const config = useRuntimeConfig()
    const body = await readBody<LoginRequestBody>(event)

    try {
        // API'ye login isteği gönder
        const res = await ofetch<LoginResponse>(`${config.apiBaseUrl}/auth/login`, {
            method: 'POST',
            body
        })

        const token = res.token
        const decoded = jwtDecode<JwtPayload>(token)
        const fullName = `${decoded.firstName} ${decoded.lastName}`

        // Rol bilgisi sadece cookie'de kalır, frontend göremez
        setCookie(event, 'auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 2 // 2 saat
        })

        return {
            statusCode: 200,
            message: 'İşlem başarılı',
            user: {
                fullName
            }
        }

    } catch (error: any) {
        if (error.response?.status === 401) {
            return {
                statusCode: 401,
                message: 'Kullanıcı adı veya şifre yanlış'
            }
        }

        console.error('Sunucu hatası:', error)
        return {
            statusCode: 500,
            message: 'Sunucu hatası'
        }
    }
})
