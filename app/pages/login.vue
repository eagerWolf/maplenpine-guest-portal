<script setup lang="ts">
definePageMeta({ layout: 'auth' })

// Step: 'login' | 'set-password'
const step = ref<'login' | 'set-password'>('login')

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function submitLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Vnesi email in geslo.'
    return
  }
  loading.value = true
  try {
    const res = await $fetch<{ firstLogin?: boolean; success?: boolean; role?: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    if (res.firstLogin) {
      password.value = ''
      step.value = 'set-password'
    } else if (res.success) {
      await navigateTo(res.role === 'admin' ? '/admin' : '/staff')
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? 'Napaka pri prijavi.'
  } finally {
    loading.value = false
  }
}

async function submitSetPassword() {
  error.value = ''
  if (password.value.length < 8) {
    error.value = 'Geslo mora biti dolgo vsaj 8 znakov.'
    return
  }
  if (password.value !== passwordConfirm.value) {
    error.value = 'Gesli se ne ujemata.'
    return
  }
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; role: string }>('/api/auth/set-password', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await navigateTo(res.role === 'admin' ? '/admin' : '/staff')
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? 'Napaka pri nastavljanju gesla.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-card">
    <div class="login-brand">
      <img src="/logo-text-only.webp" alt="Maple & Pine" class="login-brand__logo" />
      <p class="login-brand__sub">Osebje &amp; admin portal</p>
    </div>

    <!-- Step 1: Login -->
    <template v-if="step === 'login'">
      <form class="login-form" @submit.prevent="submitLogin">
        <div class="login-form__field">
          <label for="email">E-poštni naslov</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="ime@primer.si"
          />
        </div>

        <div class="login-form__field">
          <label for="password">Geslo</label>
          <div class="login-form__password-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              class="login-form__eye"
              :aria-label="showPassword ? 'Skrij geslo' : 'Pokaži geslo'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>

        <div v-if="error" class="login-error">{{ error }}</div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Prijavljam…' : 'Prijava' }}
        </button>
      </form>
    </template>

    <!-- Step 2: Set password (first login) -->
    <template v-else>
      <div class="login-first">
        <p class="login-first__title">Nastavite geslo</p>
        <p class="login-first__sub">Dobrodošli! Ker se prijavljate prvič, izberite geslo za vaš račun.</p>
        <p class="login-first__email">{{ email }}</p>
      </div>

      <form class="login-form" @submit.prevent="submitSetPassword">
        <div class="login-form__field">
          <label for="new-password">Novo geslo</label>
          <div class="login-form__password-wrap">
            <input
              id="new-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              placeholder="vsaj 8 znakov"
            />
            <button type="button" class="login-form__eye" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>

        <div class="login-form__field">
          <label for="password-confirm">Ponovi geslo</label>
          <input
            id="password-confirm"
            v-model="passwordConfirm"
            type="password"
            autocomplete="new-password"
            required
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="login-error">{{ error }}</div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Shranjujem…' : 'Nastavi geslo in se prijavi' }}
        </button>

        <button type="button" class="login-back" @click="step = 'login'; password = ''; error = ''">
          ← Nazaj
        </button>
      </form>
    </template>
  </div>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 360px;
  background: #fffdf8;
  border: 1px solid #e4dccf;
  padding: 36px 32px 28px;
}

.login-brand {
  text-align: center;
  margin-bottom: 28px;
}
.login-brand__logo {
  height: 42px;
  width: auto;
}
.login-brand__sub {
  margin: 10px 0 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7b947e;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-form__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.login-form__field label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #465146;
}
.login-form__field input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #e4dccf;
  background: #fff;
  color: #243027;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 160ms ease;
  border-radius: 4px;
}
.login-form__field input:focus {
  border-color: #26372c;
}

.login-form__password-wrap {
  position: relative;
}
.login-form__password-wrap input {
  padding-right: 40px;
}
.login-form__eye {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #7b947e;
  display: flex;
  padding: 0;
}
.login-form__eye:hover { color: #26372c; }

.login-error {
  font-size: 0.85rem;
  color: #7a2e2e;
  background: #fef5f2;
  border: 1px solid #fbd0c6;
  padding: 10px 12px;
  border-radius: 4px;
}

.login-btn {
  min-height: 44px;
  background: #26372c;
  color: #fffdf8;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 160ms ease;
  margin-top: 4px;
}
.login-btn:hover:not(:disabled) { background: #3c5543; }
.login-btn:disabled { opacity: 0.5; cursor: default; }

.login-first {
  margin-bottom: 20px;
}
.login-first__title {
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 700;
  color: #202920;
}
.login-first__sub {
  margin: 0 0 10px;
  font-size: 0.88rem;
  color: #626a63;
  line-height: 1.5;
}
.login-first__email {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #26372c;
}

.login-back {
  background: none;
  border: none;
  font-size: 0.85rem;
  color: #7b947e;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  padding: 0;
}
.login-back:hover { color: #26372c; }
</style>
