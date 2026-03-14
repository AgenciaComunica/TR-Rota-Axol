<template>
  <ion-page>
    <ion-header :translucent="true" class="home-header">
      <ion-toolbar>
        <div class="header-brand">
          <img class="header-logo" src="/branding/logo_siaro.png" alt="Logo Siaro" />
        </div>
        <span class="header-title">TR-Rota</span>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="home-content">
      <section class="menu-shell">
        <section class="menu-grid">
          <button
            :class="['menu-card', 'menu-card--session', isOnline ? 'menu-card--online' : 'menu-card--offline']"
            type="button"
            @click="goToProfile"
          >
            <span class="menu-kicker menu-kicker--session">Sessão Atual</span>
            <strong class="menu-title menu-title--session">
              <span :class="['status-chip', isOnline ? 'status-chip--online' : 'status-chip--offline']">
                {{ isOnline ? 'Online' : 'Offline' }}
              </span>
              <span>{{ session?.username }}</span>
            </strong>
            <p>Confira suas informações e atualize sua senha quando estiver conectado.</p>
          </button>

          <button class="menu-card" type="button" @click="goTo('sync-transformers')">
            <span class="menu-kicker">Sincronização</span>
            <strong class="menu-title">
              <ion-icon :icon="downloadOutline" aria-hidden="true" />
              <span>Sincronizar Transformadores</span>
            </strong>
            <p>Atualizar a base local de transformadores no dispositivo.</p>
          </button>

          <button class="menu-card" type="button" @click="goTo('inspection')">
            <span class="menu-kicker">Operação</span>
            <strong class="menu-title">
              <ion-icon :icon="documentTextOutline" aria-hidden="true" />
              <span>Fazer Inspeção</span>
            </strong>
            <p>Iniciar o fluxo principal de inspeção em campo.</p>
          </button>

          <button class="menu-card" type="button" @click="goTo('sync-inspections')">
            <span class="menu-kicker">Sincronização</span>
            <strong class="menu-title">
              <ion-icon :icon="cloudUploadOutline" aria-hidden="true" />
              <span>Sincronizar Inspeções</span>
            </strong>
            <p>Enviar ou atualizar inspeções com o ambiente central.</p>
          </button>

          <button class="menu-card menu-card--logout" type="button" @click="handleLogout">
            <span class="menu-kicker">Sessão</span>
            <strong class="menu-title">
              <ion-icon :icon="logOutOutline" aria-hidden="true" />
              <span>Sair</span>
            </strong>
            <p>Encerrar a sessao atual e retornar para a tela de login.</p>
          </button>
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonHeader, IonIcon, IonPage, IonToolbar } from '@ionic/vue';
import { cloudUploadOutline, documentTextOutline, downloadOutline, logOutOutline } from 'ionicons/icons';
import { getSession, logout } from '@/services/auth';

const router = useRouter();
const session = ref(getSession());
const isOnline = ref(navigator.onLine);

function updateConnectivityStatus() {
  isOnline.value = navigator.onLine;
}

async function goTo(action: 'sync-transformers' | 'sync-inspections' | 'inspection') {
  if (action === 'inspection') {
    await router.push('/menu/inspection');
    return;
  }

  await router.push(`/menu/${action}`);
}

async function goToProfile() {
  await router.push('/profile');
}

async function handleLogout() {
  logout();
  await router.replace('/login');
}

onMounted(() => {
  window.addEventListener('online', updateConnectivityStatus);
  window.addEventListener('offline', updateConnectivityStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateConnectivityStatus);
  window.removeEventListener('offline', updateConnectivityStatus);
});
</script>

<style scoped>
.home-header ion-toolbar {
  --background: rgba(247, 249, 251, 0.94);
  --color: #223548;
  --border-color: rgba(133, 151, 169, 0.18);
  backdrop-filter: blur(10px);
}

.header-brand {
  display: flex;
  align-items: center;
  padding-left: 12px;
}

.header-logo {
  width: 38px;
  height: 38px;
  object-fit: contain;
  flex: 0 0 auto;
}

.header-title {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  color: #223548;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.home-content {
  --background:
    radial-gradient(circle at top left, rgba(127, 152, 176, 0.12), transparent 24%),
    linear-gradient(180deg, #f4f7fa 0%, #edf2f6 100%);
}

.menu-shell {
  padding: calc(env(safe-area-inset-top) + 28px) 24px 32px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.menu-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 170px;
  padding: 22px 20px;
  border-radius: 22px;
  border: 1px solid rgba(133, 151, 169, 0.18);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 24px rgba(73, 97, 124, 0.07);
  text-align: left;
  cursor: pointer;
  appearance: none;
}

.menu-card--session {
  justify-content: flex-start;
}

.menu-card--online {
  background: #335f8d;
  border-color: rgba(51, 95, 141, 0.18);
  color: #f6f8fb;
}

.menu-card--offline {
  background: #6b7b8b;
  border-color: rgba(107, 123, 139, 0.22);
  color: #f6f8fb;
}

.menu-card--logout {
  background: rgba(255, 255, 255, 0.98);
}

.menu-kicker {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #758595;
}

.menu-kicker--session {
  color: rgba(246, 248, 251, 0.74);
}

.menu-card strong {
  margin-top: 12px;
  font-size: 1.5rem;
  line-height: 1.15;
  color: #223548;
}

.menu-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-title--session {
  justify-content: flex-start;
  width: 100%;
  align-items: center;
  gap: 14px;
  flex-wrap: nowrap;
}

.menu-title ion-icon {
  flex: 0 0 auto;
  font-size: 1.35rem;
}

.menu-title span {
  display: inline-block;
}

.menu-card--session strong,
.menu-card--session p {
  color: #f4f7fb;
}

.menu-card p {
  margin: 10px 0 0;
  line-height: 1.5;
  color: #667584;
}

.menu-card--session p {
  color: rgba(246, 248, 251, 0.92);
}

.status-chip {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.status-chip--online {
  background: rgba(255, 255, 255, 0.18);
  color: #f6f8fb;
}

.status-chip--offline {
  background: rgba(255, 255, 255, 0.18);
  color: #f6f8fb;
}

@media (max-width: 520px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }

  .menu-title--session {
    flex-direction: row;
    align-items: center;
  }
}
</style>
