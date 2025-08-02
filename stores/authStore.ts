// stores/authStore.ts
import { defineStore } from 'pinia'

export type UserInfo = {
    id: number
    name: string
    role?: string
}

export const useAuthStore = defineStore('auth', {
    state: (): {
        user: UserInfo | null
    } => ({
        user: null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.user?.id,
        isLoggedName: (state) => !!state.user?.name,
        isAdmin: (state) => state.user?.role === 'admin',
        isDirector: (state) => ['admin', 'director'].includes(state.user?.role ?? ''),
    },
    actions: {
        setUser(user: UserInfo) {
            this.user = user
        },
        clearUser() {
            this.user = null
        }
    }
})
