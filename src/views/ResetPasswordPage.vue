<template>
  <ion-page>
    <ion-header :translucent="true" class="reset-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/profile" text="Voltar" />
        </ion-buttons>
        <ion-title>Redefinir senha</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="reset-content">
      <section class="reset-shell">
        <div class="intro-card">
          <span class="card-label">Usuário</span>
          <strong>{{ session?.username }}</strong>
          <p>Informe a nova senha e confirme para concluir a alteração.</p>
        </div>

        <form class="reset-form" @submit.prevent="handleSubmit">
          <label class="field">
            <span>Nova senha</span>
            <ion-input
              v-model="form.password"
              aria-label="Nova senha"
              autocomplete="new-password"
              fill="outline"
              placeholder="Digite a nova senha"
              type="password"
            />
          </label>

          <label class="field">
            <span>Confirmação da senha</span>
            <ion-input
              v-model="form.confirmation"
              aria-label="Confirmação da senha"
              autocomplete="new-password"
              fill="outline"
              placeholder="Repita a nova senha"
              type="password"
            />
          </label>

          <p v-if="message" :class="['feedback', message.type]">
            {{ message.text }}
          </p>

          <ion-button class="submit-button" expand="block" size="large" type="submit" :disabled="isSubmitting || !isOnline">
            {{ isSubmitting ? 'Atualizando...' : 'Salvar nova senha' }}
          </ion-button>
        </form>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { getSession, resetPassword } from '@/services/auth';

interface FeedbackMessage {
  text: string;
  type: 'error' | 'success';
}

const router = useRouter();
const session = ref(getSession());
const isOnline = ref(navigator.onLine);
const isSubmitting = ref(false);
const message = ref<FeedbackMessage | null>(null);
const form = reactive({
  password: '',
  confirmation: '',
});

async function handleSubmit() {
  message.value = null;
  isSubmitting.value = true;

  try {
    await resetPassword(form.password, form.confirmation);
    message.value = {
      text: 'Senha redefinida com sucesso.',
      type: 'success',
    };
    form.password = '';
    form.confirmation = '';
    setTimeout(() => {
      void router.replace('/profile');
    }, 700);
  } catch (error) {
    message.value = {
      text: error instanceof Error ? error.message : 'Falha ao redefinir senha.',
      type: 'error',
    };
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.reset-header ion-toolbar {
  --background: rgba(247, 249, 251, 0.94);
  --color: #223548;
  --border-color: rgba(133, 151, 169, 0.18);
}

.reset-content {
  --background:
    radial-gradient(circle at top left, rgba(127, 152, 176, 0.12), transparent 24%),
    linear-gradient(180deg, #f4f7fa 0%, #edf2f6 100%);
}

.reset-shell {
  padding: calc(env(safe-area-inset-top) + 28px) 24px 32px;
}

.intro-card {
  margin-bottom: 16px;
  padding: 20px;
  border: 1px solid rgba(133, 151, 169, 0.18);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 24px rgba(73, 97, 124, 0.07);
}

.card-label {
  display: block;
  margin-bottom: 8px;
  color: #6c7c8b;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.intro-card strong {
  display: block;
  color: #223548;
  font-size: 1.15rem;
}

.intro-card p {
  margin: 10px 0 0;
  color: #667584;
  line-height: 1.55;
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

.submit-button {
  --background: #335f8d;
  --background-hover: #2c537b;
  --border-radius: 20px;
  min-height: 62px;
  font-weight: 700;
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
</style>
