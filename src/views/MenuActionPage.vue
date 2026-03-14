<template>
  <ion-page>
    <ion-header :translucent="true" class="action-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Voltar" />
        </ion-buttons>
        <ion-title>{{ pageTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="action-content">
      <section class="action-shell">
        <p class="eyebrow">TR-ROTA</p>
        <h1>{{ pageTitle }}</h1>
        <p class="description">{{ pageDescription }}</p>

        <div class="action-card">
          <span class="action-label">Status da funcionalidade</span>
            <strong>Fluxo preparado para a próxima story.</strong>
            <p>
            Esta tela confirma o acesso pelo menu principal e reserva o espaço
            da funcionalidade dentro do fluxo autenticado do aplicativo.
            </p>
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';

const route = useRoute();

const contentMap = {
  'sync-transformers': {
    title: 'Sincronizar Transformadores',
    description: 'Área reservada para carga e atualização de transformadores no dispositivo.',
  },
  'sync-inspections': {
    title: 'Sincronizar Inspeções',
    description: 'Área reservada para sincronização manual das inspeções com o sistema central.',
  },
  inspection: {
    title: 'Fazer Inspeção',
    description: 'Área reservada para abertura do formulário principal de inspeção em campo.',
  },
} as const;

const pageKey = computed(() => {
  const value = route.params.action;
  return typeof value === 'string' ? value : 'inspection';
});

const pageContent = computed(() => {
  return contentMap[pageKey.value as keyof typeof contentMap] ?? contentMap.inspection;
});

const pageTitle = computed(() => pageContent.value.title);
const pageDescription = computed(() => pageContent.value.description);
</script>

<style scoped>
.action-header ion-toolbar {
  --background: rgba(247, 249, 251, 0.94);
  --color: #223548;
  --border-color: rgba(133, 151, 169, 0.18);
}

.action-content {
  --background:
    radial-gradient(circle at top left, rgba(127, 152, 176, 0.12), transparent 24%),
    linear-gradient(180deg, #f4f7fa 0%, #edf2f6 100%);
}

.action-shell {
  padding: calc(env(safe-area-inset-top) + 28px) 24px 32px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #5b748c;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.action-shell h1 {
  margin: 0;
  color: #223548;
  font-size: 2rem;
  line-height: 1.08;
}

.description {
  margin: 14px 0 0;
  max-width: 34rem;
  color: #667584;
  line-height: 1.6;
}

.action-card {
  margin-top: 24px;
  padding: 22px 20px;
  border: 1px solid rgba(133, 151, 169, 0.18);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 24px rgba(73, 97, 124, 0.07);
}

.action-label {
  display: block;
  margin-bottom: 8px;
  color: #6c7c8b;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.action-card strong {
  display: block;
  color: #223548;
  font-size: 1.1rem;
}

.action-card p {
  margin: 10px 0 0;
  color: #667584;
  line-height: 1.55;
}
</style>
