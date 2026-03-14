import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { readonly, ref } from 'vue';

const isOnline = ref(true);
let initialized = false;

async function refreshNetworkStatus() {
  try {
    const status = await Network.getStatus();
    isOnline.value = status.connected;
  } catch {
    isOnline.value = navigator.onLine;
  }
}

function setupBrowserListeners() {
  const updateStatus = () => {
    isOnline.value = navigator.onLine;
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
}

async function ensureNetworkTracking() {
  if (initialized) {
    return;
  }

  initialized = true;
  await refreshNetworkStatus();

  if (Capacitor.isNativePlatform()) {
    await Network.addListener('networkStatusChange', (status) => {
      isOnline.value = status.connected;
    });
    return;
  }

  setupBrowserListeners();
}

export function useNetworkStatus() {
  void ensureNetworkTracking();
  return readonly(isOnline);
}

export async function hasNetworkConnection() {
  await ensureNetworkTracking();
  return isOnline.value;
}
