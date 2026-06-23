<template>
  <div class="guest-wrap">
    <header class="guest-header">
      <div class="guest-header__inner">
        <a href="https://maplenpine.com" target="_blank" rel="noopener">
          <img src="/logo-text-only.webp" alt="Maple & Pine Bled" class="guest-header__logo" />
        </a>
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
  background: #1f2937;
}

.guest-header__inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 14px 24px;
}

.guest-header__logo {
  height: 40px;
  width: auto;
  display: block;
}

.guest-main {
  flex: 1;
  padding: 0 16px 64px;
}

.guest-footer {
  background: #1f2937;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.82rem;
  text-align: center;
  padding: 18px 24px;
  letter-spacing: 0.01em;
}
</style>
