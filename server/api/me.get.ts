import type { H3Event } from 'h3';
import { defineEventHandler, getCookie } from 'h3'
import { jwtDecode } from 'jwt-decode'

type JwtPayload = {
    id: number
    role: string
    firstName: string
    lastName: string
    exp: number
}

export default defineEventHandler(async (event: H3Event) => {
    const token = getCookie(event, 'auth_token')

    if (!token) {
        return { user: null }
    }

    try {
        const decoded = jwtDecode<JwtPayload>(token)

        return {
            user: {
                name: `${decoded.firstName} ${decoded.lastName}`,
                role: decoded.role
            }
        }
    } catch (err) {
        console.error('JWT çözümleme hatası:', err)
        return { user: null }
    }
})
