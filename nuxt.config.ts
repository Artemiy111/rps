// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: false,

  runtimeConfig: {
    clientUrl: '',
    serverUrl: '',
    jwtAccessSecret: 'jwt access token secret key placeholder',
    jwtRefreshSecret: 'jwt refresh token secret key placeholder',
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    'nuxt-icons',
  ],
  build: {
    transpile: ['@nuxtjs/google-fonts'],
  },
  ssr: false,
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
  i18n: {
    defaultLocale: 'ru',
    locales: [
      {
        code: 'ru',
        name: 'Russian',
      },
      {
        code: 'en',
        name: 'English',
      },
    ],
  },
})
