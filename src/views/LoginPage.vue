<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-shell">
        <section class="login-card">
          <img
            v-if="hasLogo"
            class="brand-logo"
            :src="logoSrc"
            alt="Logo Siaro"
            @error="handleLogoError"
          />
          <div v-else class="brand-fallback" aria-hidden="true">TR</div>

          <div class="card-head">
            <h1>TR-Rota</h1>
            <p class="card-subtitle">Acesso ao sistema</p>
            <span :class="['status-badge', isOnline ? 'online' : 'offline']">
              {{ isOnline ? 'Online' : 'Offline' }}
            </span>
          </div>

          <form class="login-form" @submit.prevent="handleSubmit">
            <label class="field">
              <span>Email ou usuário</span>
              <ion-input
                v-model="form.username"
                aria-label="Email ou usuário"
                autocomplete="username"
                fill="outline"
                inputmode="email"
                placeholder="seu.email@empresa.com ou usuário"
              />
            </label>

            <label class="field">
              <span>Senha</span>
              <ion-input
                v-model="form.password"
                aria-label="Senha"
                autocomplete="current-password"
                fill="outline"
                placeholder="Digite sua senha"
                type="password"
              />
            </label>

            <div class="meta-row">
              <span class="meta-label">
                {{
                  isOnline
                    ? 'Validacao online ativa'
                    : 'Login offline disponivel apenas com cache local'
                }}
              </span>
            </div>

            <p v-if="message" :class="['feedback', message.type]">
              {{ message.text }}
            </p>

            <ion-button
              class="submit-button"
              expand="block"
              size="large"
              type="submit"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Validando...' : 'Entrar' }}
            </ion-button>

            <p class="support-text">
              Acesso de teste:
              <strong>tecnico</strong> ou
              <strong>tecnico@trrota.local</strong>
              com senha <strong>trrota123</strong>.
            </p>
          </form>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonContent, IonInput, IonPage } from '@ionic/vue';
import { login } from '@/services/auth';
import { useNetworkStatus } from '@/services/network';

interface FeedbackMessage {
  text: string;
  type: 'error' | 'success';
}

const router = useRouter();
const form = reactive({
  username: '',
  password: '',
});
const isSubmitting = ref(false);
const isOnline = useNetworkStatus();
const message = ref<FeedbackMessage | null>(null);
const hasApiUrl = computed(() => Boolean(import.meta.env.VITE_AUTH_API_URL));
const hasLogo = ref(true);
const logoSrc = '/branding/logo_siaro.png';

function handleLogoError() {
  hasLogo.value = false;
}

async function handleSubmit() {
  message.value = null;
  isSubmitting.value = true;

  try {
    const session = await login(form.username, form.password);
    const successMessage = hasApiUrl.value
      ? `Acesso liberado para ${session.username}.`
      : `Acesso liberado para ${session.username} em modo demonstrativo/cache.`;

    message.value = {
      text: successMessage,
      type: 'success',
    };

    await router.replace('/home');
  } catch (error) {
    message.value = {
      text: error instanceof Error ? error.message : 'Falha ao autenticar.',
      type: 'error',
    };
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.login-content {
  --background:
    radial-gradient(circle at top left, rgba(117, 142, 166, 0.12), transparent 24%),
    linear-gradient(180deg, #f4f7fa 0%, #ebf0f4 100%);
}

.login-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px;
}

.login-card {
  width: min(100%, 460px);
  padding: 28px 24px;
  border: 1px solid rgba(132, 151, 170, 0.24);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 30px rgba(73, 97, 124, 0.08);
}

.brand-logo {
  display: block;
  width: min(100%, 248px);
  max-height: 118px;
  margin: 0 auto 18px;
  object-fit: contain;
}

.brand-fallback {
  margin: 0 auto 18px;
  color: #335f8d;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-align: center;
}

.card-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  width: 100%;
}

.card-head h1 {
  margin: 0;
  font-size: 2.05rem;
  width: 100%;
  text-align: center;
  color: #223548;
}

.card-subtitle {
  margin: 0;
  color: #6c7c8b;
  font-size: 0.94rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 9px 12px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-top: 4px;
}

.status-badge.online {
  background: rgba(54, 108, 162, 0.1);
  color: #315f8c;
}

.status-badge.offline {
  background: rgba(207, 86, 86, 0.12);
  color: #b04343;
}

.login-form {
  margin-top: 20px;
}

.field {
  display: block;
  margin-bottom: 18px;
}

.field span {
  display: block;
  margin-bottom: 8px;
  color: #3b5268;
  font-size: 0.92rem;
  font-weight: 700;
}

.field ion-input {
  --background: #fbfcfd;
  --border-color: rgba(136, 154, 171, 0.2);
  --border-radius: 16px;
  --color: #223548;
  --padding-bottom: 16px;
  --padding-end: 18px;
  --padding-start: 18px;
  --padding-top: 16px;
  min-height: 60px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 4px 0 16px;
}

.meta-label {
  color: #6c7c8b;
  font-size: 0.84rem;
}

.submit-button {
  margin-top: 4px;
  --background: #335f8d;
  --background-hover: #2c537b;
  --border-radius: 20px;
  --box-shadow: 0 10px 22px rgba(61, 91, 123, 0.16);
  min-height: 64px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.feedback {
  margin: 0 0 18px;
  padding: 14px 16px;
  border-radius: 14px;
  font-weight: 600;
}

.feedback.error {
  background: rgba(185, 67, 67, 0.08);
  border: 1px solid rgba(185, 67, 67, 0.12);
  color: #8f3636;
}

.feedback.success {
  background: rgba(37, 128, 90, 0.08);
  border: 1px solid rgba(37, 128, 90, 0.12);
  color: #206348;
}

.support-text {
  margin: 16px 0 0;
  color: #71808d;
  font-size: 0.84rem;
  line-height: 1.5;
}

@media (max-width: 520px) {
  .login-shell {
    padding: 16px;
  }

  .login-card {
    padding: 24px 18px;
  }

  .card-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
