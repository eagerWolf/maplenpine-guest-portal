<script setup lang="ts">
import { LOCALES } from '~/i18n/translations'

const { data: publicSettings } = await useFetch<Record<string, string>>('/api/public/settings')
const instagramUrl = computed(() => publicSettings.value?.instagram_url ?? '')
const facebookUrl = computed(() => publicSettings.value?.facebook_url ?? '')
const breakfastEnabled = computed(() => publicSettings.value?.breakfast_enabled === '1')

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap' },
  ],
})

const guestToken = useGuestToken()
const accessBlocked = useGuestAccessBlocked()
const adminPreview = useAdminGuestPreview()
const homeLink = computed(() => (guestToken.value && !accessBlocked.value) ? `/guest/${guestToken.value}` : '/')
function infoLink(page: string) {
  return guestToken.value ? `/guest/${guestToken.value}/info/${page}` : '/'
}
const { t, locale, setLocale } = useLocale()

const drawerOpen = ref(false)
function closeDrawer() { drawerOpen.value = false }

const route = useRoute()
watch(() => route.path, closeDrawer)
</script>

<template>
  <div class="guest-wrap">
    <header class="guest-header">
      <div class="guest-header__inner">
        <NuxtLink :to="homeLink" class="guest-header__logo-link">
          <img src="/logo-text-only.webp" alt="Maple & Pine Bled" class="guest-header__logo" />
        </NuxtLink>

        <!-- Desktop nav + lang -->
        <div class="guest-header__right">
          <nav class="guest-nav" aria-label="Guest guide">
            <NuxtLink :to="homeLink" class="guest-nav__link" :class="{ 'guest-nav__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.home }}</NuxtLink>
            <NuxtLink :to="infoLink('how-to')" class="guest-nav__link" :class="{ 'guest-nav__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.howToUse }}</NuxtLink>
            <NuxtLink :to="infoLink('faq')" class="guest-nav__link" :class="{ 'guest-nav__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.faq }}</NuxtLink>
            <NuxtLink :to="infoLink('restaurants')" class="guest-nav__link" :class="{ 'guest-nav__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.restaurants }}</NuxtLink>
            <NuxtLink :to="infoLink('suggestions')" class="guest-nav__link" :class="{ 'guest-nav__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.suggestions }}</NuxtLink>
            <NuxtLink v-if="guestToken && !accessBlocked && breakfastEnabled" :to="`/guest/${guestToken}/breakfast`" class="guest-nav__link guest-nav__link--breakfast">🍳 {{ t.nav.breakfast }}</NuxtLink>
          </nav>
          <div class="lang-switcher" role="group" aria-label="Language">
            <button
              v-for="l in LOCALES"
              :key="l.code"
              class="lang-btn"
              :class="{ 'lang-btn--active': locale === l.code }"
              @click="setLocale(l.code)"
            >{{ l.label }}</button>
          </div>
        </div>

        <!-- Mobile hamburger -->
        <button class="menu-btn" :aria-expanded="drawerOpen" aria-label="Menu" @click="drawerOpen = !drawerOpen">
          <span class="menu-btn__bar" :class="{ 'menu-btn__bar--open': drawerOpen }" />
        </button>
      </div>
    </header>
    <div v-if="adminPreview" class="admin-preview-warning">
      Administratorski predogled: dostop gosta je že potekel. Omejitev veljavnosti je začasno prezrta.
    </div>

    <!-- Mobile drawer -->
    <Transition name="drawer">
      <div v-if="drawerOpen" class="drawer" @click.self="closeDrawer">
        <div class="drawer__panel">
          <div class="drawer__header">
            <NuxtLink :to="homeLink" class="drawer__logo-link" @click="closeDrawer">
              <img src="/logo-text-only.webp" alt="Maple & Pine Bled" class="drawer__logo" />
            </NuxtLink>
            <button class="drawer__close" aria-label="Zapri meni" @click="closeDrawer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <nav class="drawer__nav" aria-label="Guest guide">
            <NuxtLink :to="homeLink" class="drawer__link" :class="{ 'drawer__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.home }}</NuxtLink>
            <NuxtLink :to="infoLink('how-to')" class="drawer__link" :class="{ 'drawer__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.howToUse }}</NuxtLink>
            <NuxtLink :to="infoLink('faq')" class="drawer__link" :class="{ 'drawer__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.faq }}</NuxtLink>
            <NuxtLink :to="infoLink('restaurants')" class="drawer__link" :class="{ 'drawer__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.restaurants }}</NuxtLink>
            <NuxtLink :to="infoLink('suggestions')" class="drawer__link" :class="{ 'drawer__link--disabled': accessBlocked }" :aria-disabled="accessBlocked">{{ t.nav.suggestions }}</NuxtLink>
            <NuxtLink v-if="guestToken && !accessBlocked && breakfastEnabled" :to="`/guest/${guestToken}/breakfast`" class="drawer__link">🍳 {{ t.nav.breakfast }}</NuxtLink>
          </nav>
          <div class="drawer__lang" role="group" aria-label="Language">
            <button
              v-for="l in LOCALES"
              :key="l.code"
              class="drawer__lang-btn"
              :class="{ 'drawer__lang-btn--active': locale === l.code }"
              @click="setLocale(l.code)"
            >{{ l.label }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <div class="guest-main">
      <slot />
    </div>

    <footer class="guest-footer">
      <div class="guest-footer__inner">
        <div class="guest-footer__social">
          <a
            v-if="instagramUrl"
            :href="instagramUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="social-btn"
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            <span class="social-btn__label">Instagram</span>
          </a>
          <a
            v-if="facebookUrl"
            :href="facebookUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="social-btn"
            aria-label="Facebook"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
            <span class="social-btn__label">Facebook</span>
          </a>
        </div>
        <span class="guest-footer__copy">Maple &amp; Pine Apartments · Bled, Slovenia</span>
      </div>
    </footer>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
}

.guest-wrap {
  min-height: 100dvh;
  background: #f5f1e9;
  display: flex;
  flex-direction: column;
}

.guest-header {
  background: #1e3a8a;
}

.admin-preview-warning {
  background: #fff7d6;
  border-bottom: 1px solid #e6cc72;
  color: #755b08;
  padding: 10px 20px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 650;
}

.guest-header__inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.guest-header__logo-link {
  display: block;
  flex-shrink: 0;
}

.guest-header__logo {
  height: 36px;
  width: auto;
  display: block;
}

.guest-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.guest-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.guest-nav__link {
  padding: 7px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 253, 248, 0.72);
  text-decoration: none;
  border-radius: 5px;
  transition: color 140ms ease, background 140ms ease;
  white-space: nowrap;
}
.guest-nav__link:hover,
.guest-nav__link.router-link-active {
  color: #fffdf8;
  background: rgba(255, 253, 248, 0.1);
}

.guest-nav__link--breakfast {
  border: 1px solid rgba(255, 253, 248, 0.2);
  border-radius: 5px;
}

.guest-nav__link--disabled {
  pointer-events: none;
  opacity: 0.35;
}
.guest-nav__link--disabled:hover { background: none; }

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 2px;
  border-left: 1px solid rgba(255, 253, 248, 0.15);
  padding-left: 12px;
}

.lang-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px 7px;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 253, 248, 0.5);
  border-radius: 4px;
  letter-spacing: 0.04em;
  transition: color 120ms ease, background 120ms ease;
  line-height: 1;
}
.lang-btn:hover {
  color: #fffdf8;
  background: rgba(255, 253, 248, 0.1);
}
.lang-btn--active {
  color: #fffdf8;
  background: rgba(255, 253, 248, 0.15);
}

.guest-main {
  flex: 1;
  padding: 0 16px 64px;
}

.guest-footer {
  background: #1e3a8a;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.82rem;
  text-align: center;
  padding: 28px 24px 20px;
  letter-spacing: 0.01em;
}

.guest-footer__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.guest-footer__copy {
  display: block;
}

.guest-footer__social {
  display: flex;
  align-items: center;
  gap: 10px;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px 8px 11px;
  border-radius: 7px;
  background: rgba(255, 253, 248, 0.08);
  color: rgba(255, 253, 248, 0.6);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: background 160ms ease, color 160ms ease;
  border: 1px solid rgba(255, 253, 248, 0.1);
}
.social-btn:hover {
  background: rgba(255, 253, 248, 0.14);
  color: #fffdf8;
  border-color: rgba(255, 253, 248, 0.2);
}

.social-btn__label {
  line-height: 1;
}

/* ── Mobile hamburger button ── */
.menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  gap: 5px;
  flex-shrink: 0;
}

.menu-btn__bar,
.menu-btn__bar::before,
.menu-btn__bar::after {
  display: block;
  width: 22px;
  height: 2px;
  background: rgba(255, 253, 248, 0.85);
  border-radius: 2px;
  transition: transform 220ms ease, opacity 220ms ease;
}

.menu-btn__bar {
  position: relative;
}

.menu-btn__bar::before,
.menu-btn__bar::after {
  content: '';
  position: absolute;
  left: 0;
}

.menu-btn__bar::before { top: -6px; }
.menu-btn__bar::after  { top:  6px; }

.menu-btn__bar--open { background: transparent; }
.menu-btn__bar--open::before { transform: translateY(6px) rotate(45deg); }
.menu-btn__bar--open::after  { transform: translateY(-6px) rotate(-45deg); }

/* ── Drawer ── */
.drawer {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 20, 45, 0.6);
  backdrop-filter: blur(3px);
}

.drawer__panel {
  background: #1e3a8a;
  display: flex;
  flex-direction: column;
}

.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 12px 24px;
  border-bottom: 1px solid rgba(255, 253, 248, 0.1);
}

.drawer__logo-link { display: block; }

.drawer__logo {
  height: 32px;
  width: auto;
  display: block;
}

.drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 253, 248, 0.08);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255, 253, 248, 0.85);
  transition: background 140ms ease, color 140ms ease;
}
.drawer__close:hover {
  background: rgba(255, 253, 248, 0.15);
  color: #fffdf8;
}

.drawer__nav {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 253, 248, 0.1);
}

.drawer__link {
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 253, 248, 0.8);
  text-decoration: none;
  transition: background 140ms ease, color 140ms ease;
}
.drawer__link:hover,
.drawer__link.router-link-active {
  color: #fffdf8;
  background: rgba(255, 253, 248, 0.07);
}

.drawer__link--disabled {
  pointer-events: none;
  opacity: 0.35;
}
.drawer__link--disabled:hover { background: none; }

.drawer__lang {
  display: flex;
  gap: 6px;
  padding: 16px 24px;
}

.drawer__lang-btn {
  background: rgba(255, 253, 248, 0.08);
  border: 1px solid rgba(255, 253, 248, 0.15);
  cursor: pointer;
  padding: 7px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 253, 248, 0.55);
  border-radius: 5px;
  letter-spacing: 0.05em;
  transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
  font-family: inherit;
}
.drawer__lang-btn:hover {
  color: #fffdf8;
  background: rgba(255, 253, 248, 0.15);
}
.drawer__lang-btn--active {
  color: #fffdf8;
  background: rgba(255, 253, 248, 0.18);
  border-color: rgba(255, 253, 248, 0.35);
}

/* ── Drawer transition ── */
.drawer-enter-active,
.drawer-leave-active { transition: opacity 200ms ease; }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; }

.drawer-enter-active .drawer__panel,
.drawer-leave-active .drawer__panel { transition: transform 220ms ease; }
.drawer-enter-from .drawer__panel,
.drawer-leave-to .drawer__panel { transform: translateY(-10px); }

/* ── Responsive ── */
@media (max-width: 640px) {
  .guest-header__right { display: none; }
  .menu-btn { display: flex; }
}

@media (max-width: 480px) {
  .guest-header__inner { padding: 10px 16px; }
}
</style>
