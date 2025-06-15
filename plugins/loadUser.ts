export default defineNuxtPlugin(async (nuxtApp) => {
    const user = useState('user')

    // Sadece eğer user zaten yoksa ve server-side ise getir
    if (!user.value) {
        try {
            const res = await $fetch('/api/me', {
                credentials: 'include' // Cookie gönderimi
            })

            if (res?.user) {
                user.value = res.user
            }
        } catch (e) {
            user.value = null
        }
    }
})
