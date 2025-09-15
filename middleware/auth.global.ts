export default defineNuxtRouteMiddleware(async (to) => {
  const PUBLIC = new Set(['/login'])
  const { user } = useAuth()

  // Login sayfası serbest
  if (to.path === '/login') {
    if (user.value) {
      return navigateTo('/dashboard')
    }
    return
  }

  // Public sayfalar serbest
  if (PUBLIC.has(to.path)) return

  // Diğer sayfalar → user yoksa login'e at
  if (!user.value) {
    return navigateTo('/login')
  }
})
