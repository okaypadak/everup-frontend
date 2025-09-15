export default defineNuxtRouteMiddleware(async (to) => {
  const PUBLIC = new Set(['/login'])

  const { user, fetchMe } = useAuth()

  // Login sayfası: zaten auth'luysa dashboard'a
  if (to.path === '/login') {
    if (!user.value) await fetchMe()
    if (user.value) return navigateTo('/dashboard')
    return
  }

  // Public sayfalar serbest
  if (PUBLIC.has(to.path)) return

  // Diğerleri için auth zorunlu
  if (!user.value) await fetchMe()
  if (!user.value) return navigateTo('/login')
})
