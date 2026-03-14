<template>
  <ion-page>
    <ion-header :translucent="true" class="start-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/menu/inspection" text="Voltar" />
        </ion-buttons>
        <ion-title>Inspeção do Transformador</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="start-content">
      <section class="start-shell">
        <div v-if="transformer" class="transformer-card">
          <span class="card-label">Transformador selecionado</span>
          <strong>{{ transformer.code }}</strong>
          <p>Série {{ transformer.serialNumber }}</p>
          <p>{{ transformer.substation }} · {{ transformer.city }}</p>
        </div>

        <div v-if="transformer" class="form-shell">
          <section class="form-section">
            <div class="section-head">
              <h2>Status de acesso e identificação</h2>
            </div>

            <div class="question-block">
              <h3>Status do acesso</h3>
              <div class="choice-grid">
                <button
                  v-for="option in accessOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.accessStatus, option)"
                  @click="form.accessStatus = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="question-block">
              <h3>Identificação do equipamento</h3>
              <div class="choice-grid">
                <button
                  v-for="option in identificationOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.identificationStatus, option)"
                  @click="form.identificationStatus = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="question-block">
              <h3>Condição da tag</h3>
              <div class="choice-grid">
                <button
                  v-for="option in tagConditionOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.tagCondition, option)"
                  @click="form.tagCondition = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-head">
              <h2>Temperaturas</h2>
            </div>

            <div class="question-block">
              <h3>Temperatura do óleo</h3>
              <div class="choice-grid">
                <button
                  v-for="option in temperatureOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.oilTemperature, option)"
                  @click="form.oilTemperature = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="question-block">
              <h3>Temperatura do enrolamento</h3>
              <div class="choice-grid">
                <button
                  v-for="option in temperatureOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.windingTemperature, option)"
                  @click="form.windingTemperature = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="question-block">
              <h3>Temperatura ambiente</h3>
              <div class="choice-grid">
                <button
                  v-for="option in ambientOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.ambientTemperature, option)"
                  @click="form.ambientTemperature = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-head">
              <h2>Sistema de conexão</h2>
            </div>

            <div class="question-block">
              <h3>Conexão primária</h3>
              <div class="choice-grid">
                <button
                  v-for="option in connectionOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.primaryConnection, option)"
                  @click="form.primaryConnection = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="question-block">
              <h3>Conexão secundária</h3>
              <div class="choice-grid">
                <button
                  v-for="option in connectionOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.secondaryConnection, option)"
                  @click="form.secondaryConnection = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="question-block">
              <h3>Aterramento</h3>
              <div class="choice-grid">
                <button
                  v-for="option in groundingOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.groundingStatus, option)"
                  @click="form.groundingStatus = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-head">
              <h2>Sistema ativo</h2>
            </div>

            <div class="question-block">
              <h3>Status operacional</h3>
              <div class="choice-grid">
                <button
                  v-for="option in operationOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.operationStatus, option)"
                  @click="form.operationStatus = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="question-block">
              <h3>Sistema de resfriamento</h3>
              <div class="choice-grid">
                <button
                  v-for="option in coolingOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.coolingStatus, option)"
                  @click="form.coolingStatus = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="question-block">
              <h3>Alarmes ativos</h3>
              <div class="choice-grid">
                <button
                  v-for="option in alarmOptions"
                  :key="option.value"
                  type="button"
                  :class="choiceClass(form.activeAlarmStatus, option)"
                  @click="form.activeAlarmStatus = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </section>

          <p v-if="message" :class="['feedback', message.type]">
            {{ message.text }}
          </p>

          <ion-button class="submit-button" expand="block" size="large" @click="handleSubmit">
            {{ isEditing ? 'Atualizar inspeção' : 'Registrar inspeção' }}
          </ion-button>
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
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
import { getInspectionById, saveInspection, updateInspection } from '@/services/inspections';
import { getTransformerById } from '@/services/transformers';

interface FeedbackMessage {
  text: string;
  type: 'error' | 'success';
}

interface ChoiceOption {
  value: string;
  label: string;
  tone: 'positive' | 'warning' | 'danger';
}

const route = useRoute();
const router = useRouter();
const transformer = computed(() => {
  const value = route.params.id;
  return typeof value === 'string' ? getTransformerById(value) : null;
});
const draftInspectionId = computed(() => {
  const value = route.query.draft;
  return typeof value === 'string' ? value : '';
});
const draftInspection = computed(() => {
  if (!draftInspectionId.value) {
    return null;
  }

  return getInspectionById(draftInspectionId.value);
});

const form = reactive({
  accessStatus: '',
  identificationStatus: '',
  tagCondition: '',
  oilTemperature: '',
  windingTemperature: '',
  ambientTemperature: '',
  primaryConnection: '',
  secondaryConnection: '',
  groundingStatus: '',
  operationStatus: '',
  coolingStatus: '',
  activeAlarmStatus: '',
});

const message = ref<FeedbackMessage | null>(null);
const isEditing = computed(() => Boolean(draftInspection.value));

const accessOptions: ChoiceOption[] = [
  { value: 'Liberado', label: 'Liberado', tone: 'positive' },
  { value: 'Parcial', label: 'Parcial', tone: 'warning' },
  { value: 'Bloqueado', label: 'Bloqueado', tone: 'danger' },
];

const identificationOptions: ChoiceOption[] = [
  { value: 'Confirmada', label: 'Confirmada', tone: 'positive' },
  { value: 'Divergente', label: 'Divergente', tone: 'warning' },
  { value: 'Não localizada', label: 'Não localizada', tone: 'danger' },
];

const tagConditionOptions: ChoiceOption[] = [
  { value: 'Legível', label: 'Legível', tone: 'positive' },
  { value: 'Parcial', label: 'Parcial', tone: 'warning' },
  { value: 'Ilegível', label: 'Ilegível', tone: 'danger' },
];

const temperatureOptions: ChoiceOption[] = [
  { value: 'Normal', label: 'Normal', tone: 'positive' },
  { value: 'Atenção', label: 'Atenção', tone: 'warning' },
  { value: 'Crítica', label: 'Crítica', tone: 'danger' },
];

const ambientOptions: ChoiceOption[] = [
  { value: 'Normal', label: 'Normal', tone: 'positive' },
  { value: 'Baixa', label: 'Baixa', tone: 'warning' },
  { value: 'Elevada', label: 'Elevada', tone: 'danger' },
];

const connectionOptions: ChoiceOption[] = [
  { value: 'Conforme', label: 'Conforme', tone: 'positive' },
  { value: 'Requer ajuste', label: 'Requer ajuste', tone: 'warning' },
  { value: 'Inoperante', label: 'Inoperante', tone: 'danger' },
];

const groundingOptions: ChoiceOption[] = [
  { value: 'Conforme', label: 'Conforme', tone: 'positive' },
  { value: 'Atenção', label: 'Atenção', tone: 'warning' },
  { value: 'Irregular', label: 'Irregular', tone: 'danger' },
];

const operationOptions: ChoiceOption[] = [
  { value: 'Em operação', label: 'Em operação', tone: 'positive' },
  { value: 'Stand-by', label: 'Stand-by', tone: 'warning' },
  { value: 'Fora de operação', label: 'Fora de operação', tone: 'danger' },
];

const coolingOptions: ChoiceOption[] = [
  { value: 'Normal', label: 'Normal', tone: 'positive' },
  { value: 'Atenção', label: 'Atenção', tone: 'warning' },
  { value: 'Falha', label: 'Falha', tone: 'danger' },
];

const alarmOptions: ChoiceOption[] = [
  { value: 'Sem alarmes', label: 'Sem alarmes', tone: 'positive' },
  { value: 'Alarme leve', label: 'Alarme leve', tone: 'warning' },
  { value: 'Alarme crítico', label: 'Alarme crítico', tone: 'danger' },
];

function hasPendingFields() {
  return Object.values(form).some((value) => !value);
}

function resetForm() {
  form.accessStatus = '';
  form.identificationStatus = '';
  form.tagCondition = '';
  form.oilTemperature = '';
  form.windingTemperature = '';
  form.ambientTemperature = '';
  form.primaryConnection = '';
  form.secondaryConnection = '';
  form.groundingStatus = '';
  form.operationStatus = '';
  form.coolingStatus = '';
  form.activeAlarmStatus = '';
}

function hydrateForm() {
  if (!draftInspection.value) {
    return;
  }

  form.accessStatus = draftInspection.value.accessStatus;
  form.identificationStatus = draftInspection.value.identificationStatus;
  form.tagCondition = draftInspection.value.tagCondition;
  form.oilTemperature = draftInspection.value.oilTemperature;
  form.windingTemperature = draftInspection.value.windingTemperature;
  form.ambientTemperature = draftInspection.value.ambientTemperature;
  form.primaryConnection = draftInspection.value.primaryConnection;
  form.secondaryConnection = draftInspection.value.secondaryConnection;
  form.groundingStatus = draftInspection.value.groundingStatus;
  form.operationStatus = draftInspection.value.operationStatus;
  form.coolingStatus = draftInspection.value.coolingStatus;
  form.activeAlarmStatus = draftInspection.value.activeAlarmStatus;
}

function choiceClass(selectedValue: string, option: ChoiceOption) {
  return [
    'choice-button',
    `choice-button--${option.tone}`,
    selectedValue === option.value ? 'is-selected' : '',
  ];
}

async function handleSubmit() {
  if (!transformer.value) {
    message.value = {
      text: 'Transformador inválido para registro da inspeção.',
      type: 'error',
    };
    return;
  }

  if (hasPendingFields()) {
    message.value = {
      text: 'Preencha todas as seções da inspeção antes de registrar.',
      type: 'error',
    };
    return;
  }

  const payload = {
    transformerId: transformer.value.id,
    transformerCode: transformer.value.code,
    ...form,
  };

  if (draftInspection.value) {
    updateInspection(draftInspection.value.id, payload);
  } else {
    saveInspection(payload);
  }

  message.value = {
    text: draftInspection.value
      ? 'Inspeção atualizada com sucesso no dispositivo.'
      : 'Inspeção registrada com sucesso no dispositivo.',
    type: 'success',
  };

  resetForm();
  await router.replace('/menu/sync-inspections');
}

hydrateForm();
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
  padding: calc(env(safe-area-inset-top) + 28px) 24px calc(env(safe-area-inset-bottom) + 88px);
}

.transformer-card,
.form-section,
.empty-card {
  padding: 20px;
  border: 1px solid rgba(133, 151, 169, 0.18);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 24px rgba(73, 97, 124, 0.07);
}

.form-shell {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.section-head {
  margin-bottom: 14px;
}

.section-head h2 {
  margin: 0;
  color: #223548;
  font-size: 1.02rem;
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

.question-block + .question-block {
  margin-top: 18px;
}

.question-block h3 {
  margin: 0 0 10px;
  color: #42586d;
  font-size: 0.96rem;
  font-weight: 700;
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.choice-button {
  min-height: 76px;
  padding: 16px 8px;
  border: 1px solid transparent;
  border-radius: 18px;
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.2;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
}

.choice-button--positive {
  background: #eef7f1;
  border-color: #d7eadc;
  color: #5a7b65;
}

.choice-button--warning {
  background: #fdf6e8;
  border-color: #f1dfb6;
  color: #8f7741;
}

.choice-button--danger {
  background: #faecec;
  border-color: #efd2d2;
  color: #8f5c5c;
}

.choice-button--positive.is-selected {
  background: #2f8a59;
  border-color: #2f8a59;
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(47, 138, 89, 0.18);
}

.choice-button--warning.is-selected {
  background: #d5a228;
  border-color: #d5a228;
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(213, 162, 40, 0.2);
}

.choice-button--danger.is-selected {
  background: #cf5656;
  border-color: #cf5656;
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(207, 86, 86, 0.18);
}

.feedback {
  margin: 0;
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

.submit-button {
  margin-top: 4px;
  --background: #335f8d;
  --background-hover: #2c537b;
  --border-radius: 22px;
  min-height: 72px;
  font-weight: 700;
}
</style>
