// composables/useAuth.ts
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

export const useAuth = () => {
    const authStore = useAuthStore()
    const { user, isAdmin, isDirector, isLoggedIn, isLoggedName } = storeToRefs(authStore)

    return {
        user,
        isAdmin,
        isDirector,
        isLoggedIn,
        isLoggedName,
        setUser: authStore.setUser,
        clearUser: authStore.clearUser,
    }
}
