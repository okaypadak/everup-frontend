import type { H3Event } from 'h3';
import { defineEventHandler, readBody, setCookie } from 'h3'
import { ofetch } from 'ofetch'

type LoginRequestBody = {
    email: string
    password: string
}

type BackendLoginResponse = {
    message: string
    expiresAt: string
    user: {
        id: number
        firstName: string
        lastName: string
        role: string
    }
}

type PublicUser = {
    fullName: string
    role: string
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

const DEFAULT_MAX_AGE_SECONDS = 2 * 60 * 60

const escapeForRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const extractCookieValue = (setCookieHeader: string, cookieName: string): string | null => {
    if (!setCookieHeader) {
        return null
    }

    const cookiePattern = new RegExp(`${escapeForRegex(cookieName)}=([^;]+)`, 'i')
    const match = setCookieHeader.match(cookiePattern)
    return match?.[1] ?? null
}

const resolveMaxAge = (expiresAt?: string): number => {
    if (!expiresAt) {
        return DEFAULT_MAX_AGE_SECONDS
    }

    const expiresAtMs = Date.parse(expiresAt)
    if (Number.isNaN(expiresAtMs)) {
        return DEFAULT_MAX_AGE_SECONDS
    }

    const diffInSeconds = Math.floor((expiresAtMs - Date.now()) / 1000)
    if (diffInSeconds <= 0) {
        return 0
    }

    return diffInSeconds
}

export default defineEventHandler(async (event: H3Event): Promise<SuccessResponse | ErrorResponse> => {
    const config = useRuntimeConfig()
    const body = await readBody<LoginRequestBody>(event)

    try {
        const backendResponse = await ofetch.raw<BackendLoginResponse>(`${config.apiBaseUrl}/auth/login`, {
            method: 'POST',
            body
        })

        const loginResult = backendResponse._data

        if (!loginResult?.user) {
            console.error('Auth servisi beklenen kullanıcı bilgisini döndüremedi:', loginResult)
            return {
                statusCode: 500,
                message: 'Sunucu hatası'
            }
        }
        const setCookieHeader = backendResponse.headers.get('set-cookie') || ''
        const token = extractCookieValue(setCookieHeader, 'everup_auth_token')

        if (!token) {
            console.error('Auth servisinden token içeren çerez alınamadı:', {
                headers: backendResponse.headers,
                body: loginResult
            })
            return {
                statusCode: 500,
                message: 'Sunucu hatası'
            }
        }

        const maxAgeSeconds = resolveMaxAge(loginResult.expiresAt)
        const secure = process.env.NODE_ENV === 'production'

        setCookie(event, 'auth_token', token, {
            httpOnly: true,
            secure,
            sameSite: secure ? 'none' : 'lax',
            path: '/',
            maxAge: maxAgeSeconds
        })

        return {
            statusCode: 200,
            message: loginResult.message || 'İşlem başarılı',
            user: {
                fullName: `${loginResult.user.firstName} ${loginResult.user.lastName}`,
                role: loginResult.user.role
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
