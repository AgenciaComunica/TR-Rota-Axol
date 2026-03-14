import { hasNetworkConnection } from './network';

export type AuthMode = 'online' | 'offline-cache' | 'demo';

export interface AuthSession {
  username: string;
  email: string;
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

function resolveUserEmail(username: string) {
  const normalizedUsername = username.trim().toLowerCase();

  if (normalizedUsername.includes('@')) {
    return normalizedUsername;
  }

  if (normalizedUsername === DEMO_USERNAME) {
    return DEMO_EMAIL;
  }

  return `${normalizedUsername}@trrota.local`;
}

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
    email: resolveUserEmail(username),
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
  const session = readJson<AuthSession | (Omit<AuthSession, 'email'> & { email?: string })>(SESSION_STORAGE_KEY);

  if (!session) {
    return null;
  }

  if (!session.email) {
    const migratedSession: AuthSession = {
      ...session,
      email: resolveUserEmail(session.username),
    };
    writeJson(SESSION_STORAGE_KEY, migratedSession);
    return migratedSession;
  }

  return session as AuthSession;
}

export function isAuthenticated() {
  return Boolean(getSession());
}

export function logout() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function login(username: string, password: string) {
  const trimmedUsername = username.trim();
  const isOnline = await hasNetworkConnection();

  if (!trimmedUsername || !password) {
    throw new Error('Informe email ou usuário e senha.');
  }

  if (isOnline) {
    const apiResult = await validateWithApi(trimmedUsername, password);

    if (apiResult === true) {
      await cacheCredentials(trimmedUsername, password);
      return saveSession(trimmedUsername, 'online');
    }

    if (apiResult === false) {
      throw new Error('Credenciais inválidas.');
      
    }

    const demoResult = await validateWithDemoCredentials(trimmedUsername, password);

    if (demoResult) {
      await cacheCredentials(trimmedUsername, password);
      return saveSession(trimmedUsername, 'demo');
    }

    throw new Error('Credenciais inválidas.');
  }

  const cache = readJson<CachedCredentials>(CACHE_STORAGE_KEY);

  if (!cache || cache.username !== trimmedUsername) {
    throw new Error('Sem conexão e sem credenciais em cache para este usuário.');
  }

  const passwordHash = await hashPassword(password);

  if (cache.passwordHash !== passwordHash) {
    throw new Error('Credenciais inválidas para acesso offline.');
  }

  return saveSession(trimmedUsername, 'offline-cache');
}

export async function resetPassword(password: string, confirmation: string) {
  const session = getSession();
  const isOnline = await hasNetworkConnection();

  if (!session) {
    throw new Error('Sessão indisponível.');
  }

  if (!isOnline) {
    throw new Error('A redefinição de senha exige conexão com a internet.');
  }

  if (!password || !confirmation) {
    throw new Error('Informe a nova senha e a confirmação.');
  }

  if (password.length < 6) {
    throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
  }

  if (password !== confirmation) {
    throw new Error('Senha e confirmação precisam ser iguais.');
  }

  const endpoint = import.meta.env.VITE_RESET_PASSWORD_API_URL;

  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: session.username,
        email: session.email,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error('Não foi possível redefinir a senha.');
    }
  }

  await cacheCredentials(session.username, password);
}
