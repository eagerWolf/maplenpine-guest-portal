<script setup lang="ts">
const guestToken = useGuestToken()
const homeLink = computed(() => guestToken.value ? `/guest/${guestToken.value}` : '/')
</script>

<template>
  <div class="guest-wrap">
    <header class="guest-header">
      <div class="guest-header__inner">
        <NuxtLink :to="homeLink" class="guest-header__logo-link">
          <img src="/logo-text-only.webp" alt="Maple & Pine Bled" class="guest-header__logo" />
        </NuxtLink>
        <nav class="guest-nav" aria-label="Guest guide">
          <NuxtLink to="/guest/info/how-to" class="guest-nav__link">How to use</NuxtLink>
          <NuxtLink to="/guest/info/faq" class="guest-nav__link">FAQ</NuxtLink>
        </nav>
      </div>
    </header>

    <div class="guest-main">
      <slot />
    </div>

    <footer class="guest-footer">
      <div class="guest-footer__inner">
        Maple &amp; Pine Apartments · Bled, Slovenia
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
  background: #26372c;
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

.guest-main {
  flex: 1;
  padding: 0 16px 64px;
}

.guest-footer {
  background: #26372c;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.82rem;
  text-align: center;
  padding: 18px 24px;
  letter-spacing: 0.01em;
}

@media (max-width: 480px) {
  .guest-header__inner { padding: 10px 16px; }
  .guest-nav__link { padding: 6px 9px; font-size: 0.8rem; }
}
</style>
