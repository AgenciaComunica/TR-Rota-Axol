<template>
  <ion-page>
    <ion-header :translucent="true" class="inspection-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Voltar" />
        </ion-buttons>
        <ion-title>Fazer Inspeção</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="inspection-content">
      <section class="inspection-shell">
        <div v-if="transformers.length === 0" class="empty-card">
          <strong>Sincronização obrigatória</strong>
          <p>Sincronize os transformadores antes de iniciar uma inspeção em campo.</p>
          <ion-button class="empty-button" expand="block" size="large" @click="goToSync">
            Ir para Sincronizar Transformadores
          </ion-button>
        </div>

        <template v-else>
          <div class="section-head">
            <h2>Selecione um transformador</h2>
            <span>{{ filteredTransformers.length }}</span>
          </div>

          <ion-searchbar
            v-model="searchTerm"
            class="filter-searchbar"
            placeholder="Filtrar por série, local ou tag"
          />

          <div v-if="filteredTransformers.length === 0" class="empty-card">
            <strong>Nenhum transformador encontrado</strong>
            <p>Revise o filtro informado para localizar o equipamento desejado.</p>
          </div>

          <button
            v-for="transformer in filteredTransformers"
            :key="transformer.id"
            class="transformer-card"
            type="button"
            @click="openInspection(transformer.id)"
          >
            <strong>{{ transformer.code }}</strong>
            <span>Série {{ transformer.serialNumber }}</span>
            <p>{{ transformer.substation }} · {{ transformer.city }}</p>
          </button>
        </template>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { filterTransformers, getSynchronizedTransformers } from '@/services/transformers';

const router = useRouter();
const transformers = ref(getSynchronizedTransformers());
const searchTerm = ref('');
const filteredTransformers = computed(() => filterTransformers(transformers.value, searchTerm.value));

async function goToSync() {
  await router.push('/menu/sync-transformers');
}

async function openInspection(id: string) {
  await router.push(`/inspection/${id}`);
}
</script>

<style scoped>
.inspection-header ion-toolbar {
  --background: rgba(247, 249, 251, 0.94);
  --color: #223548;
  --border-color: rgba(133, 151, 169, 0.18);
}

.inspection-content {
  --background:
    radial-gradient(circle at top left, rgba(127, 152, 176, 0.12), transparent 24%),
    linear-gradient(180deg, #f4f7fa 0%, #edf2f6 100%);
}

.inspection-shell {
  padding: calc(env(safe-area-inset-top) + 28px) 24px 32px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-head h2 {
  margin: 0;
  color: #223548;
  font-size: 1.1rem;
}

.section-head span {
  color: #6c7c8b;
  font-size: 0.88rem;
  font-weight: 700;
}

.filter-searchbar {
  margin-bottom: 14px;
  --background: rgba(255, 255, 255, 0.94);
  --border-radius: 18px;
  --box-shadow: 0 10px 24px rgba(73, 97, 124, 0.06);
  --color: #223548;
  --placeholder-color: #738191;
}

.empty-card,
.transformer-card {
  display: block;
  width: 100%;
  margin-bottom: 12px;
  padding: 18px;
  border: 1px solid rgba(133, 151, 169, 0.18);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 24px rgba(73, 97, 124, 0.07);
  text-align: left;
}

.empty-card strong,
.transformer-card strong {
  display: block;
  color: #223548;
  font-size: 1.05rem;
}

.empty-card p,
.transformer-card p {
  margin: 8px 0 0;
  color: #667584;
  line-height: 1.55;
}

.transformer-card {
  cursor: pointer;
  appearance: none;
}

.transformer-card span {
  display: block;
  margin-top: 6px;
  color: #52697f;
  font-weight: 700;
}

.empty-button {
  margin-top: 14px;
  --background: #335f8d;
  --background-hover: #2c537b;
  --border-radius: 20px;
  min-height: 62px;
  font-weight: 700;
}
</style>
