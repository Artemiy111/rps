// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxtjs/tailwindcss', '@nuxtjs/google-fonts'],
  build: {
    transpile: ['@nuxtjs/google-fonts'],
  },
  css: ['~/assets/style/index.css'],
  googleFonts: {
    download: true,
    overwriting: false,
    inject: true,

    families: {
      Ubuntu: {
        wght: [400, 500, 700],
      },
    },
  },
})
