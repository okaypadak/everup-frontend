export default defineNuxtRouteMiddleware(async (to) => {
    // Public rotalar (gerekirse genişlet)
    const PUBLIC = new Set(['/', '/blog', '/login', '/register']);

    // login sayfasında kullanıcı zaten girişliyse dashboard'a at
    if (to.path === '/login') {
        const { user, fetchMe } = useAuth();
        if (!user.value) await fetchMe();
        if (user.value) return navigateTo('/dashboard');
        return; // login public, kalan işlem yok
    }

    // public ise dokunma
    if (PUBLIC.has(to.path)) return;

    // gerisi korumalı
    const { user, fetchMe } = useAuth();
    if (!user.value) await fetchMe();
    if (!user.value) return navigateTo('/login');
});
