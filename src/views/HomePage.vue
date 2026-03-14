<template>
  <ion-page>
    <ion-header :translucent="true" class="home-header">
      <ion-toolbar>
        <ion-title>TR-ROTA</ion-title>
        <ion-button slot="end" fill="clear" class="logout-button" @click="handleLogout">
          Sair
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="home-content">
      <section class="hero">
        <p class="eyebrow">Operacao em movimento</p>
        <h1>Menu principal do analista em campo.</h1>
        <p class="hero-text">
          Sessao ativa para <strong>{{ session?.username }}</strong>. A partir
          daqui o tecnico acessa os fluxos operacionais com botoes amplos e de
          leitura direta.
        </p>

        <div class="status-card">
          <div>
            <span class="status-label">Modo de autenticacao</span>
            <strong>{{ authModeLabel }}</strong>
          </div>
          <span class="status-chip">{{ isOnline ? 'Conectado' : 'Offline' }}</span>
        </div>
      </section>

      <section class="menu-grid">
        <article class="menu-card menu-card--primary">
          <span class="menu-kicker">Proxima etapa</span>
          <strong>Nova analise</strong>
          <p>Iniciar inspecao de transformador com formulario simplificado.</p>
        </article>

        <article class="menu-card">
          <span class="menu-kicker">Consulta local</span>
          <strong>Analises salvas</strong>
          <p>Revisar registros pendentes de sincronizacao no dispositivo.</p>
        </article>

        <article class="menu-card">
          <span class="menu-kicker">Sincronizacao</span>
          <strong>Enviar analises</strong>
          <p>Selecionar manualmente o que deve ser descarregado ao servidor.</p>
        </article>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Acesso liberado</h2>
          <p>Esta tela confirma que o login foi validado e o menu principal foi aberto.</p>
        </div>

        <article class="feature-item">
          <div>
            <strong>Login com cache offline</strong>
            <p>Se o acesso ja foi validado antes, o tecnico pode entrar sem internet.</p>
          </div>
          <span>{{ session?.mode ?? 'Sessao' }}</span>
        </article>

        <article class="feature-item">
          <div>
            <strong>Credenciais protegidas no dispositivo</strong>
            <p>O app guarda apenas um hash da senha para revalidacao offline.</p>
          </div>
          <span>Cache</span>
        </article>

        <article class="feature-item">
          <div>
            <strong>Integracao pronta para API</strong>
            <p>Com `VITE_AUTH_API_URL`, a validacao online passa a consultar o servidor central.</p>
          </div>
          <span>API</span>
        </article>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { getSession, logout } from '@/services/auth';

const router = useRouter();
const session = ref(getSession());
const isOnline = ref(navigator.onLine);

const authModeLabel = computed(() => {
  if (!session.value) {
    return 'Sessao indisponivel';
  }

  switch (session.value.mode) {
    case 'online':
      return 'Validado no servidor';
    case 'offline-cache':
      return 'Validado por cache offline';
    default:
      return 'Modo demonstrativo';
  }
});

function updateConnectivityStatus() {
  isOnline.value = navigator.onLine;
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

.logout-button {
  margin-right: 12px;
  --color: #335f8d;
  font-weight: 700;
}

.home-content {
  --background:
    radial-gradient(circle at top left, rgba(127, 152, 176, 0.12), transparent 24%),
    linear-gradient(180deg, #f4f7fa 0%, #edf2f6 100%);
}

.hero {
  padding: calc(env(safe-area-inset-top) + 32px) 24px 28px;
  color: #223548;
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5b748c;
}

.hero h1 {
  margin: 0;
  font-size: 2.1rem;
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: #223548;
}

.hero-text {
  margin: 16px 0 0;
  max-width: 32rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #667584;
}

.status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding: 18px 20px;
  border: 1px solid rgba(133, 151, 169, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(73, 97, 124, 0.08);
}

.status-label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c7c8b;
}

.status-card strong {
  font-size: 1.1rem;
  color: #223548;
}

.status-chip {
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(52, 95, 141, 0.1);
  color: #315f8c;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 0 24px;
  margin-top: -12px;
}

.menu-card {
  display: flex;
  flex-direction: column;
  padding: 18px 16px;
  border-radius: 18px;
  border: 1px solid rgba(133, 151, 169, 0.18);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 24px rgba(73, 97, 124, 0.07);
}

.menu-card--primary {
  background: #335f8d;
  border-color: rgba(51, 95, 141, 0.18);
  color: #f6f8fb;
}

.menu-kicker {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #758595;
}

.menu-card--primary .menu-kicker {
  color: rgba(246, 248, 251, 0.74);
}

.menu-card strong {
  margin-top: 12px;
  font-size: 1.6rem;
  color: #223548;
}

.menu-card--primary strong {
  color: #f4f7fb;
}

.menu-card p {
  margin: 10px 0 0;
  line-height: 1.5;
  color: #667584;
}

.menu-card--primary p {
  color: rgba(246, 248, 251, 0.84);
}

.panel {
  padding: 28px 24px 36px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.35rem;
  color: #223548;
}

.panel-header p {
  margin: 8px 0 0;
  color: #6a7988;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 14px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(133, 151, 169, 0.18);
}

.feature-item strong {
  display: block;
  margin-bottom: 6px;
  color: #2a3e51;
}

.feature-item p {
  margin: 0;
  line-height: 1.5;
  color: #6a7988;
}

.feature-item span {
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(52, 95, 141, 0.1);
  color: #315f8c;
  font-size: 0.78rem;
  font-weight: 700;
}

@media (max-width: 520px) {
  .hero h1 {
    font-size: 1.8rem;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }

  .status-card,
  .feature-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
