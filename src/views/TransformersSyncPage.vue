<template>
  <ion-page>
    <ion-header :translucent="true" class="sync-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Voltar" />
        </ion-buttons>
        <ion-title>Sincronizar Transformadores</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="sync-content">
      <section class="sync-shell">
        <ion-button class="sync-button" expand="block" size="large" :disabled="isSubmitting || !isOnline" @click="handleSync">
          <ion-icon slot="start" :icon="downloadOutline" aria-hidden="true" />
          {{ isSubmitting ? 'Sincronizando...' : 'Sincronizar agora' }}
        </ion-button>

        <div class="status-row">
          <span :class="['status-badge', isOnline ? 'status-badge--online' : 'status-badge--offline']">
            {{ isOnline ? 'Online' : 'Offline' }}
          </span>
          <span class="status-badge status-badge--neutral">
            Disponíveis: {{ availableCount ?? 0 }}
          </span>
          <span class="status-badge status-badge--neutral">
            Sincronizados: {{ transformers.length }}
          </span>
        </div>

        <p v-if="message" :class="['feedback', message.type]">
          {{ message.text }}
        </p>

        <section class="list-section">
          <div class="section-head">
            <h2>Transformadores sincronizados</h2>
            <span>{{ filteredTransformers.length }}</span>
          </div>

          <ion-searchbar
            v-model="searchTerm"
            class="filter-searchbar"
            placeholder="Filtrar por série, local ou tag"
          />

          <div v-if="transformers.length === 0" class="empty-card">
            Nenhum transformador sincronizado no dispositivo.
          </div>

          <div v-else-if="filteredTransformers.length === 0" class="empty-card">
            Nenhum transformador encontrado com o filtro informado.
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
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { downloadOutline } from 'ionicons/icons';
import {
  fetchAvailableTransformers,
  filterTransformers,
  getSynchronizedTransformers,
  synchronizeTransformers,
} from '@/services/transformers';

interface FeedbackMessage {
  text: string;
  type: 'error' | 'success';
}

const router = useRouter();
const transformers = ref(getSynchronizedTransformers());
const isSubmitting = ref(false);
const isOnline = ref(navigator.onLine);
const message = ref<FeedbackMessage | null>(null);
const availableCount = ref<number | null>(null);
const searchTerm = ref('');
const filteredTransformers = computed(() => filterTransformers(transformers.value, searchTerm.value));

function updateConnectivityStatus() {
  isOnline.value = navigator.onLine;
}

async function loadAvailableCount() {
  if (!navigator.onLine) {
    availableCount.value = null;
    return;
  }

  try {
    const records = await fetchAvailableTransformers();
    availableCount.value = records.length;
  } catch {
    availableCount.value = null;
  }
}

async function handleSync() {
  message.value = null;
  isSubmitting.value = true;

  try {
    transformers.value = await synchronizeTransformers();
    await loadAvailableCount();
    message.value = {
      text: 'Transformadores sincronizados com sucesso.',
      type: 'success',
    };
  } catch (error) {
    message.value = {
      text: error instanceof Error ? error.message : 'Falha ao sincronizar transformadores.',
      type: 'error',
    };
  } finally {
    isSubmitting.value = false;
  }
}

async function openInspection(id: string) {
  await router.push(`/inspection/${id}`);
}

onMounted(() => {
  void loadAvailableCount();
  window.addEventListener('online', updateConnectivityStatus);
  window.addEventListener('offline', updateConnectivityStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateConnectivityStatus);
  window.removeEventListener('offline', updateConnectivityStatus);
});
</script>

<style scoped>
.sync-header ion-toolbar {
  --background: rgba(247, 249, 251, 0.94);
  --color: #223548;
  --border-color: rgba(133, 151, 169, 0.18);
}

.sync-content {
  --background:
    radial-gradient(circle at top left, rgba(127, 152, 176, 0.12), transparent 24%),
    linear-gradient(180deg, #f4f7fa 0%, #edf2f6 100%);
}

.sync-shell {
  padding: calc(env(safe-area-inset-top) + 28px) 24px 32px;
}

.sync-button {
  --background: #335f8d;
  --background-hover: #2c537b;
  --border-radius: 22px;
  min-height: 72px;
  font-weight: 700;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge--online {
  background: rgba(52, 95, 141, 0.12);
  color: #315f8c;
}

.status-badge--offline {
  background: rgba(107, 123, 139, 0.14);
  color: #5f6f7e;
}

.status-badge--neutral {
  background: rgba(108, 124, 139, 0.1);
  color: #52697f;
}

.feedback {
  margin: 14px 0 0;
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

.list-section {
  margin-top: 24px;
}

.filter-searchbar {
  margin-bottom: 14px;
  --background: rgba(255, 255, 255, 0.94);
  --border-radius: 18px;
  --box-shadow: 0 10px 24px rgba(73, 97, 124, 0.06);
  --color: #223548;
  --placeholder-color: #738191;
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

.empty-card {
  color: #667584;
}

.transformer-card {
  cursor: pointer;
  appearance: none;
}

.transformer-card strong {
  display: block;
  color: #223548;
  font-size: 1.05rem;
}

.transformer-card span {
  display: block;
  margin-top: 6px;
  color: #52697f;
  font-weight: 700;
}

.transformer-card p {
  margin: 8px 0 0;
  color: #667584;
}
</style>
