// stores/authStore.ts
import { defineStore } from 'pinia'

export type UserInfo = {
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
        userName: (state) => state.user?.name ?? '',
        hasRole: (state) => (role: string) => state.user?.role === role,
        hasAnyRole: (state) => (roles: string[]) => roles.includes(state.user?.role ?? ''),
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
