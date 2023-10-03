// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    host: '0.0.0.0',
    port: 8038, 
  },
  devtools: { 
    enabled: true,
  },
  modules: [
    'nuxt-quasar-ui'
  ],
  quasar: { /* */ },
})
