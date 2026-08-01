export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
  ],

  runtimeConfig: {
    bentralApiKey: process.env.BENTRAL_API_KEY || '',
    bentralPropertyId: process.env.BENTRAL_PROPERTY_ID || '5f7a55304e675f4d',
    bentralUnitIdMaple: process.env.BENTRAL_UNIT_ID_MAPLE || '',
    bentralUnitIdPine: process.env.BENTRAL_UNIT_ID_PINE || '',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    adminEmailFrom: process.env.ADMIN_EMAIL_FROM || 'portal@maplenpine.com',
    adminEmailTo: process.env.ADMIN_EMAIL_TO || '',
    guestEmailFrom: process.env.GUEST_EMAIL_FROM || 'dostop@maplenpine.com',
    bentralHotCron: process.env.BENTRAL_HOT_CRON || '*/30 * * * *',
    bentralWarmCron: process.env.BENTRAL_WARM_CRON || '0 */5 * * *',
    bentralColdCron: process.env.BENTRAL_COLD_CRON || '0 3 * * *',
    housekeeperCron: process.env.HOUSEKEEPER_CRON || '0 10 * * *',
    whatsappProvider: process.env.WHATSAPP_PROVIDER || 'stub',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM || '',
    whatsappWebhookUrl: process.env.WHATSAPP_WEBHOOK_URL || '',
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
  },

  compatibilityDate: '2024-11-01',
})
