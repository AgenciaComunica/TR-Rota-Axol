<template>
  <ion-page>
    <ion-header :translucent="true" class="start-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Voltar" />
        </ion-buttons>
        <ion-title>Inspeção do Transformador</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="start-content">
      <section class="start-shell">
        <div v-if="transformer" class="transformer-card">
          <span class="card-label">Transformador selecionado</span>
          <strong>{{ transformer.code }}</strong>
          <p>{{ transformer.substation }} · {{ transformer.feeder }}</p>
          <p>{{ transformer.voltageClass }} · {{ transformer.city }}</p>
        </div>

        <div v-else class="empty-card">
          <strong>Transformador não encontrado</strong>
          <p>Volte e escolha um transformador sincronizado para continuar.</p>
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
import { getTransformerById } from '@/services/transformers';

const route = useRoute();
const transformer = computed(() => {
  const value = route.params.id;
  return typeof value === 'string' ? getTransformerById(value) : null;
});
</script>

<style scoped>
.start-header ion-toolbar {
  --background: rgba(247, 249, 251, 0.94);
  --color: #223548;
  --border-color: rgba(133, 151, 169, 0.18);
}

.start-content {
  --background:
    radial-gradient(circle at top left, rgba(127, 152, 176, 0.12), transparent 24%),
    linear-gradient(180deg, #f4f7fa 0%, #edf2f6 100%);
}

.start-shell {
  padding: calc(env(safe-area-inset-top) + 28px) 24px 32px;
}

.transformer-card,
.empty-card {
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

.transformer-card strong,
.empty-card strong {
  display: block;
  color: #223548;
  font-size: 1.15rem;
}

.transformer-card p,
.empty-card p {
  margin: 10px 0 0;
  color: #667584;
  line-height: 1.55;
}
</style>
