export type AuthMode = 'online' | 'offline-cache' | 'demo';

export interface AuthSession {
  username: string;
  authenticatedAt: string;
  mode: AuthMode;
}

interface CachedCredentials {
  username: string;
  passwordHash: string;
  validatedAt: string;
}

const SESSION_STORAGE_KEY = 'tr-rota:auth-session';
const CACHE_STORAGE_KEY = 'tr-rota:auth-cache';
const DEMO_USERNAME = 'tecnico';
const DEMO_EMAIL = 'tecnico@trrota.local';
const DEMO_PASSWORD = 'trrota123';

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function hashPassword(password: string) {
  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', encoded);

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

async function cacheCredentials(username: string, password: string) {
  const cache: CachedCredentials = {
    username,
    passwordHash: await hashPassword(password),
    validatedAt: new Date().toISOString(),
  };

  writeJson(CACHE_STORAGE_KEY, cache);
}

function saveSession(username: string, mode: AuthMode) {
  const session: AuthSession = {
    username,
    authenticatedAt: new Date().toISOString(),
    mode,
  };

  writeJson(SESSION_STORAGE_KEY, session);
  return session;
}

async function validateWithApi(username: string, password: string) {
  const endpoint = import.meta.env.VITE_AUTH_API_URL;

  if (!endpoint) {
    return null;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    return false;
  }

  return true;
}

async function validateWithDemoCredentials(username: string, password: string) {
  const normalizedUsername = username.toLowerCase();

  return (
    (normalizedUsername === DEMO_USERNAME || normalizedUsername === DEMO_EMAIL) &&
    password === DEMO_PASSWORD
  );
}

export function getSession() {
  return readJson<AuthSession>(SESSION_STORAGE_KEY);
}

export function isAuthenticated() {
  return Boolean(getSession());
}

export function logout() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function login(username: string, password: string) {
  const trimmedUsername = username.trim();

  if (!trimmedUsername || !password) {
    throw new Error('Informe email ou usuario e senha.');
  }

  if (navigator.onLine) {
    const apiResult = await validateWithApi(trimmedUsername, password);

    if (apiResult === true) {
      await cacheCredentials(trimmedUsername, password);
      return saveSession(trimmedUsername, 'online');
    }

    if (apiResult === false) {
      throw new Error('Credenciais invalidas.');
    }

    const demoResult = await validateWithDemoCredentials(trimmedUsername, password);

    if (demoResult) {
      await cacheCredentials(trimmedUsername, password);
      return saveSession(trimmedUsername, 'demo');
    }

    throw new Error('Credenciais invalidas.');
  }

  const cache = readJson<CachedCredentials>(CACHE_STORAGE_KEY);

  if (!cache || cache.username !== trimmedUsername) {
    throw new Error('Sem conexao e sem credenciais em cache para este usuario.');
  }

  const passwordHash = await hashPassword(password);

  if (cache.passwordHash !== passwordHash) {
    throw new Error('Credenciais invalidas para acesso offline.');
  }

  return saveSession(trimmedUsername, 'offline-cache');
}
