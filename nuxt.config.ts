export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
  ],

  runtimeConfig: {
    orchestratorApiKey: process.env.ORCHESTRATOR_API_KEY || '',
    bentralApiKey: process.env.BENTRAL_API_KEY || '',
    bentralPropertyId: process.env.BENTRAL_PROPERTY_ID || '5f7a55304e675f4d',
    bentralUnitIdMaple: process.env.BENTRAL_UNIT_ID_MAPLE || '',
    bentralUnitIdPine: process.env.BENTRAL_UNIT_ID_PINE || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    adminEmailFrom: process.env.ADMIN_EMAIL_FROM || 'portal@maplenpine.com',
    adminEmailTo: process.env.ADMIN_EMAIL_TO || '',
    guestEmailFrom: process.env.GUEST_EMAIL_FROM || 'dostop@maplenpine.com',
    bentralHotCron: process.env.BENTRAL_HOT_CRON || '*/30 * * * *',
    bentralWarmCron: process.env.BENTRAL_WARM_CRON || '0 */5 * * *',
    bentralColdCron: process.env.BENTRAL_COLD_CRON || '0 3 * * *',
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
      instagramUrl: process.env.NUXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/maplenpine.bled',
      facebookUrl: process.env.NUXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/maplenpinebled',
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
  },

  compatibilityDate: '2024-11-01',
})
