type UserInfo = {
    name: string
    role?: string
}

export const useAuth = () => {
    const user = useState<UserInfo>('user')

    const isLoggedIn = computed(() => !!user.value?.name)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isDirector = computed(() => ['admin', 'director'].includes(user.value?.role ?? ''))

    return {
        user,
        isLoggedIn,
        isAdmin,
        isDirector
    }
}
