import { beforeEach, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useLocale } from '../app/composables/useLocale'

let cookie = ref<string | null>(null)
let states = new Map<string, ReturnType<typeof ref>>()
let mounted: (() => void)[] = []
let storage: Map<string, string>

beforeEach(() => {
  cookie = ref(null)
  states = new Map()
  mounted = []
  storage = new Map()
  vi.stubGlobal('window', {})
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  })
  vi.stubGlobal('useCookie', () => cookie)
  vi.stubGlobal('useState', (key: string, init: () => unknown) => {
    if (!states.has(key)) states.set(key, ref(init()))
    return states.get(key)
  })
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('onMounted', (callback: () => void) => mounted.push(callback))
})

it('keeps the chosen language when Start reapplies the reservation default', () => {
  const home = useLocale()
  home.initializeLocale('sl')
  const menu = useLocale()
  menu.setLocale('de')
  const reopenedHome = useLocale()
  reopenedHome.initializeLocale('sl')
  expect(home.locale.value).toBe('de')
  expect(reopenedHome.locale.value).toBe('de')
  expect(cookie.value).toBe('de')
  expect(storage.get('mp-locale')).toBe('de')
})

it('restores local storage on a new visit, including a direct menu page', () => {
  storage.set('mp-locale', 'hr')
  const menu = useLocale()
  mounted.forEach(callback => callback())
  menu.initializeLocale('sl')
  expect(menu.locale.value).toBe('hr')
})

it('uses the cookie when local storage is blocked and rejects invalid languages', () => {
  cookie.value = 'sr'
  vi.stubGlobal('localStorage', {
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
  })
  const portal = useLocale()
  portal.initializeLocale('sl')
  portal.setLocale('invalid')
  expect(portal.locale.value).toBe('sr')
  portal.setLocale('de')
  expect(portal.locale.value).toBe('de')
})

it('ignores invalid stored values and uses the reservation language initially', () => {
  storage.set('mp-locale', 'invalid')
  const portal = useLocale()
  portal.initializeLocale('sl')
  expect(portal.locale.value).toBe('sl')
})
