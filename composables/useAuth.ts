// composables/useAuth.ts
import type { AuthSession } from '~/types/auth'

export function useAuth() {
    const user = useState<AuthSession['user'] | null>('auth_user', () => null)

    const fetchMe = async () => {
        const res = await $fetch<{ user: AuthSession['user'] | null }>('/api/auth/me', { method: 'GET' })
        user.value = res?.user ?? null
    }

    const login = async (username: string) => {
        await $fetch('/api/auth/login', { method: 'POST', body: { username } })
        await fetchMe() // cookie set edildikten sonra kullanıcıyı kesinleştir
    }

    const logout = async () => {
        await $fetch('/api/auth/logout', { method: 'POST' })
        user.value = null
    }

    const isAuthenticated = computed(() => !!user.value)

    return { user, isAuthenticated, fetchMe, login, logout }
}
