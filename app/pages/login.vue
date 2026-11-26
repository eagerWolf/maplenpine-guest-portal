<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

function submitFromPassword(event: KeyboardEvent) {
  if (event.isComposing || loading.value) return
  event.preventDefault()
  const input = event.currentTarget as HTMLInputElement
  input.form?.requestSubmit()
}

async function submitLogin(event: SubmitEvent) {
  if (loading.value) return
  // Read actual form values too: password managers can fill inputs without updating Vue's model.
  const fields = new FormData(event.currentTarget as HTMLFormElement)
  email.value = String(fields.get('email') || '').trim()
  password.value = String(fields.get('password') || '')
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Vnesi email in geslo.'
    return
  }
  loading.value = true
  try {
    const res = await $fetch<{ success?: boolean; role?: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    if (res.success) {
      // A document navigation also makes a successful sign-in clear to password managers.
      window.location.assign('/admin')
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage ?? 'Napaka pri prijavi.'
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
      <form id="login-form" action="/api/auth/login" method="post" autocomplete="on" class="login-form" @submit.prevent="submitLogin">
        <div class="login-form__field">
          <label for="email">E-poštni naslov</label>
          <input
            id="email"
            name="email"
            v-model="email"
            type="email"
            autocomplete="username"
            required
            placeholder="ime@primer.si"
          />
        </div>

        <div class="login-form__field">
          <label for="password">Geslo</label>
          <div class="login-form__password-wrap">
            <input
              id="password"
              name="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              enterkeyhint="go"
              @keydown.enter="submitFromPassword"
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
        <NuxtLink to="/forgot-password" class="text-center text-sm text-pine-700 underline">Pozabil sem geslo</NuxtLink>
      </form>
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
