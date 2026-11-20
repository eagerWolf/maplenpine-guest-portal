import { LOCALES, ui } from '../i18n/translations'
import type { Locale } from '../i18n/translations'

export { LOCALES }
export type { Locale }

const SUPPORTED = LOCALES.map(l => l.code)

function isLocale(v: string | null | undefined): v is Locale {
  return !!v && SUPPORTED.includes(v as Locale)
}

export const useLocale = () => {
  const cookie = useCookie<Locale | null>('mp-locale', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const selected = useState<Locale | null>('mp-selected-locale', () =>
    isLocale(cookie.value) ? cookie.value : null,
  )
  const locale = computed<Locale>(() => selected.value ?? 'en')

  function setLocale(code: string) {
    if (!isLocale(code)) return
    selected.value = code
    cookie.value = code
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('mp-locale', code) } catch { /* Storage may be blocked. */ }
    }
  }

  function restoreLocale() {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('mp-locale')
      if (isLocale(saved)) {
        setLocale(saved)
        return
      }
    } catch { /* Keep the cookie preference when storage is unavailable. */ }
    if (selected.value) setLocale(selected.value)
  }

  // Reservation language is a default, never an override of a saved preference.
  function initializeLocale(code: string) {
    restoreLocale()
    if (!selected.value) setLocale(code)
  }

  onMounted(restoreLocale)

  const t = computed(() => ui[locale.value])
  return { locale, setLocale, initializeLocale, t }
}
