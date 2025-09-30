import type { AuthSession } from '~/types/auth'

export function useAuth() {
  const user = useState<AuthSession['user'] | null>('auth_user', () => null)

  const fetchMe = async () => {
    const res = await $fetch<{ user: AuthSession['user'] | null }>('/api/auth/me', { method: 'GET' })
    user.value = res?.user ?? null
    return user.value
  }

  // GÜNCEL: email + password alır. Sunucu httpOnly cookie set eder.
  const login = async (email: string, password: string) => {
    await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
    return await fetchMe()
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  const isAuthenticated = computed(() => !!user.value)

  return { user, isAuthenticated, fetchMe, login, logout }
}
