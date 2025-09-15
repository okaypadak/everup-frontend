export default defineNuxtRouteMiddleware(async (to) => {

    const PUBLIC = new Set(['/login']);

    if (to.path === '/login') {
        const { user, fetchMe } = useAuth();
        if (!user.value) await fetchMe();
        if (user.value) return navigateTo('/dashboard');
        return;
    }

    if (PUBLIC.has(to.path)) return;

    const { user, fetchMe } = useAuth();
    if (!user.value) await fetchMe();
    if (!user.value) return navigateTo('/login');
});
