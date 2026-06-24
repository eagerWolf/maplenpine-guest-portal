import { LOCALES, ui, faqContent, howToContent, restaurantContent, suggestionContent } from '~/i18n/translations'
import type { Locale } from '~/i18n/translations'

export { LOCALES }
export type { Locale }

const SUPPORTED = LOCALES.map(l => l.code)

function isLocale(v: string | null | undefined): v is Locale {
  return !!v && SUPPORTED.includes(v as Locale)
}

export const useLocale = () => {
  const cookie = useCookie<Locale>('mp-locale', {
    default: () => 'en',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const locale = computed<Locale>(() =>
    isLocale(cookie.value) ? cookie.value : 'en',
  )

  function setLocale(code: string) {
    if (isLocale(code)) cookie.value = code
  }

  const t = computed(() => ui[locale.value])
  const faq = computed(() => faqContent[locale.value])
  const howTo = computed(() => howToContent[locale.value])
  const restaurants = computed(() => restaurantContent[locale.value])
  const suggestions = computed(() => suggestionContent[locale.value])

  return { locale, setLocale, t, faq, howTo, restaurants, suggestions }
}
