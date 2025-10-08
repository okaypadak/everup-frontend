import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/ui",
    "@pinia/nuxt"
  ],
  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL || "http://backend:9120",
    public: {
      voiceSignalingUrl:
        process.env.NUXT_PUBLIC_VOICE_SIGNALING_URL ||
        process.env.PUBLIC_VOICE_SIGNALING_URL ||
        "",
    },
  },
});
