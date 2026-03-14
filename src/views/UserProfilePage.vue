<template>
  <ion-page>
    <ion-header :translucent="true" class="profile-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Voltar" />
        </ion-buttons>
        <ion-title>Dados do Usuário</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="profile-content">
      <section class="profile-shell">
        <div class="profile-card">
          <span class="card-label">Usuário</span>
          <strong>{{ session?.username }}</strong>
        </div>

        <div class="profile-card">
          <span class="card-label">Email</span>
          <strong>{{ session?.email }}</strong>
        </div>

        <div class="profile-card">
          <span class="card-label">Status</span>
          <strong>{{ isOnline ? 'Online' : 'Offline' }}</strong>
          <p>
            {{
              isOnline
                ? 'Conexão ativa. A redefinição de senha está liberada.'
                : 'Conecte-se para habilitar a redefinição de senha.'
            }}
          </p>
        </div>

        <ion-button
          class="reset-button"
          expand="block"
          size="large"
          :disabled="!isOnline"
          @click="goToResetPassword"
        >
          Redefinir senha
        </ion-button>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { getSession } from '@/services/auth';
import { useNetworkStatus } from '@/services/network';

const router = useRouter();
const session = ref(getSession());
const isOnline = useNetworkStatus();

async function goToResetPassword() {
  if (!isOnline.value) {
    return;
  }

  await router.push('/profile/reset-password');
}
</script>

<style scoped>
.profile-header ion-toolbar {
  --background: rgba(247, 249, 251, 0.94);
  --color: #223548;
  --border-color: rgba(133, 151, 169, 0.18);
}

.profile-content {
  --background:
    radial-gradient(circle at top left, rgba(127, 152, 176, 0.12), transparent 24%),
    linear-gradient(180deg, #f4f7fa 0%, #edf2f6 100%);
}

.profile-shell {
  padding: calc(env(safe-area-inset-top) + 28px) 24px 32px;
}

.profile-card {
  margin-bottom: 14px;
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

.profile-card strong {
  display: block;
  color: #223548;
  font-size: 1.15rem;
}

.profile-card p {
  margin: 10px 0 0;
  color: #667584;
  line-height: 1.55;
}

.reset-button {
  margin-top: 8px;
  --background: #335f8d;
  --background-hover: #2c537b;
  --border-radius: 20px;
  min-height: 62px;
  font-weight: 700;
}
</style>
