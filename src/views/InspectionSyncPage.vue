<template>
  <ion-page>
    <ion-header :translucent="true" class="sync-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Voltar" />
        </ion-buttons>
        <ion-title>Sincronizar Inspeções</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="sync-content">
      <section class="sync-shell">
        <div class="sync-button-wrap" @click="handleSyncTap">
          <ion-button class="sync-button" expand="block" size="large" :disabled="isSubmitting || !isOnline" @click="handleSync">
            <ion-icon slot="start" :icon="cloudUploadOutline" aria-hidden="true" />
            {{ isSubmitting ? 'Sincronizando...' : 'Sincronizar agora' }}
          </ion-button>
        </div>

        <div class="status-row">
          <span :class="['status-badge', isOnline ? 'status-badge--online' : 'status-badge--offline']">
            {{ isOnline ? 'Online' : 'Offline' }}
          </span>
          <span class="status-badge status-badge--neutral">
            Sincronizadas: {{ synchronizedCount }}
          </span>
          <span class="status-badge status-badge--neutral">
            Realizadas: {{ inspections.length }}
          </span>
        </div>

        <p v-if="message" :class="['feedback', message.type]">
          {{ message.text }}
        </p>

        <section class="list-section">
          <div class="section-head">
            <h2>Inspeções realizadas</h2>
            <span>{{ filteredInspections.length }}</span>
          </div>

          <ion-searchbar
            v-model="searchTerm"
            class="filter-searchbar"
            placeholder="Filtrar por trafo ou data"
          />

          <div class="filter-row">
            <button
              v-for="option in filterOptions"
              :key="option.value"
              type="button"
              :class="['filter-button', selectedFilter === option.value ? 'is-active' : '']"
              @click="selectedFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>

          <div v-if="inspections.length === 0" class="empty-card">
            Nenhuma inspeção registrada no dispositivo.
          </div>

          <div v-else-if="filteredInspections.length === 0" class="empty-card">
            Nenhuma inspeção encontrada para o status selecionado.
          </div>

          <article
            v-for="inspection in filteredInspections"
            :key="inspection.id"
            class="inspection-card"
          >
            <div class="inspection-card__main">
              <div class="inspection-card__head">
                <strong>{{ inspection.transformerCode }}</strong>
                <span :class="['inspection-chip', inspection.synchronizedAt ? 'inspection-chip--synced' : 'inspection-chip--pending']">
                  {{ inspection.synchronizedAt ? 'Sincronizada' : 'Pendente' }}
                </span>
              </div>
              <span class="inspection-card__date">Realizada em {{ formatDate(inspection.createdAt) }}</span>
              <p>Acesso {{ inspection.accessStatus }} · Operação {{ inspection.operationStatus }}</p>
            </div>
            <div v-if="!inspection.synchronizedAt" class="inspection-card__actions">
              <button type="button" class="edit-button" @click="handleEdit(inspection.id)">
                Editar Inspeção
              </button>
              <button type="button" class="delete-button" @click="handleDelete(inspection.id)">
                Excluir Inspeção
              </button>
            </div>
          </article>
        </section>
      </section>

      <ion-alert
        :is-open="showSyncAlert"
        header="Confirmar sincronização"
        message="Após sincronizar, as inspeções não poderão mais ser editadas. Deseja prosseguir?"
        :buttons="syncAlertButtons"
        css-class="sync-confirm-alert"
        @didDismiss="showSyncAlert = false"
      />

      <ion-toast
        :is-open="showOfflineToast"
        message="Para sincronizar, conecte-se à rede."
        duration="2200"
        position="top"
        @didDismiss="showOfflineToast = false"
      />
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
  IonIcon,
  IonPage,
  IonAlert,
  IonSearchbar,
  IonToast,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { cloudUploadOutline } from 'ionicons/icons';
import { deleteInspection, getStoredInspections, synchronizeInspections } from '@/services/inspections';
import { useNetworkStatus } from '@/services/network';

interface FeedbackMessage {
  text: string;
  type: 'error' | 'success';
}

type InspectionFilter = 'all' | 'pending' | 'synced';

const router = useRouter();
const inspections = ref(getStoredInspections());
const isSubmitting = ref(false);
const isOnline = useNetworkStatus();
const message = ref<FeedbackMessage | null>(null);
const showSyncAlert = ref(false);
const showOfflineToast = ref(false);
const selectedFilter = ref<InspectionFilter>('all');
const searchTerm = ref('');
const filterOptions = [
  { value: 'all' as const, label: 'Todas' },
  { value: 'pending' as const, label: 'Pendentes' },
  { value: 'synced' as const, label: 'Sincronizadas' },
];
const synchronizedCount = computed(() => inspections.value.filter((item) => Boolean(item.synchronizedAt)).length);
const filteredInspections = computed(() => {
  let filtered = inspections.value;

  if (selectedFilter.value === 'pending') {
    filtered = filtered.filter((item) => !item.synchronizedAt);
  } else if (selectedFilter.value === 'synced') {
    filtered = filtered.filter((item) => Boolean(item.synchronizedAt));
  }

  const normalizedQuery = searchTerm.value.trim().toLowerCase();

  if (!normalizedQuery) {
    return filtered;
  }

  return filtered.filter((item) => {
    const formattedDate = formatDate(item.createdAt).toLowerCase();
    const searchBase = `${item.transformerCode} ${formattedDate}`.toLowerCase();
    return searchBase.includes(normalizedQuery);
  });
});

async function performSync() {
  message.value = null;
  isSubmitting.value = true;

  try {
    inspections.value = await synchronizeInspections();
    message.value = {
      text: 'Inspeções sincronizadas com sucesso.',
      type: 'success',
    };
  } catch (error) {
    message.value = {
      text: error instanceof Error ? error.message : 'Falha ao sincronizar as inspeções.',
      type: 'error',
    };
  } finally {
    isSubmitting.value = false;
  }
}

function handleSync() {
  if (!isOnline.value || isSubmitting.value) {
    return;
  }

  showSyncAlert.value = true;
}

function handleSyncTap() {
  if (!isOnline.value && !isSubmitting.value) {
    showOfflineToast.value = true;
  }
}

async function handleEdit(inspectionId: string) {
  const inspection = inspections.value.find((item) => item.id === inspectionId);

  if (!inspection || inspection.synchronizedAt) {
    return;
  }

  await router.push(`/inspection/${inspection.transformerId}?draft=${inspection.id}`);
}

function handleDelete(inspectionId: string) {
  const confirmed = window.confirm('Deseja excluir esta inspeção pendente?');

  if (!confirmed) {
    return;
  }

  try {
    inspections.value = deleteInspection(inspectionId);
    message.value = {
      text: 'Inspeção removida do dispositivo.',
      type: 'success',
    };
  } catch (error) {
    message.value = {
      text: error instanceof Error ? error.message : 'Falha ao excluir a inspeção.',
      type: 'error',
    };
  }
}

const syncAlertButtons = [
  {
    text: 'Cancelar',
    role: 'cancel',
  },
  {
    text: 'Prosseguir',
    handler: () => {
      void performSync();
    },
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
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

.sync-button-wrap {
  width: 100%;
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
  background: rgba(207, 86, 86, 0.12);
  color: #b04343;
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

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.filter-row::-webkit-scrollbar {
  display: none;
}

.filter-searchbar {
  margin-bottom: 14px;
  --background: rgba(255, 255, 255, 0.94);
  --border-radius: 18px;
  --box-shadow: 0 10px 24px rgba(73, 97, 124, 0.06);
  --color: #223548;
  --placeholder-color: #738191;
}

.filter-button {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(133, 151, 169, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #52697f;
  font-size: 0.82rem;
  font-weight: 800;
}

.filter-button.is-active {
  border-color: rgba(51, 95, 141, 0.18);
  background: rgba(51, 95, 141, 0.1);
  color: #315f8c;
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
.inspection-card {
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

.inspection-card__main {
  display: block;
  width: 100%;
  padding: 0;
  text-align: left;
}

.inspection-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.inspection-card strong {
  color: #223548;
  font-size: 1.05rem;
}

.inspection-card__date {
  display: block;
  margin-top: 8px;
  color: #52697f;
  font-weight: 700;
}

.inspection-card p,
.empty-card {
  margin: 8px 0 0;
  color: #667584;
  line-height: 1.55;
}

.inspection-card__actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
}

.edit-button,
.delete-button {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
}

.edit-button {
  border: 1px solid rgba(51, 95, 141, 0.18);
  background: rgba(51, 95, 141, 0.08);
  color: #315f8c;
}

.delete-button {
  border: 1px solid rgba(185, 67, 67, 0.18);
  background: rgba(185, 67, 67, 0.08);
  color: #8f3636;
}

:global(.sync-confirm-alert .alert-wrapper) {
  border-radius: 22px;
}

:global(.sync-confirm-alert .alert-button-group) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
}

:global(.sync-confirm-alert .alert-button) {
  min-height: 56px;
  border-radius: 18px;
  font-size: 0.95rem;
  font-weight: 800;
}

.inspection-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.inspection-chip--synced {
  background: rgba(38, 128, 91, 0.1);
  color: #206348;
}

.inspection-chip--pending {
  background: rgba(213, 162, 40, 0.14);
  color: #8a6a18;
}
</style>
