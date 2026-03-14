import { hasNetworkConnection } from './network';

export interface TransformerRecord {
  id: string;
  code: string;
  serialNumber: string;
  substation: string;
  feeder: string;
  voltageClass: string;
  city: string;
  synchronizedAt: string;
}

const TRANSFORMERS_STORAGE_KEY = 'tr-rota:transformers';
const MOCK_TRANSFORMERS: Omit<TransformerRecord, 'synchronizedAt'>[] = [
  {
    id: 'TRF-001',
    code: 'TRF-001',
    serialNumber: 'AX-2024-001',
    substation: 'SE Centro',
    feeder: 'Alimentador Norte',
    voltageClass: '69/13.8 kV',
    city: 'Uberlandia',
  },
  {
    id: 'TRF-002',
    code: 'TRF-002',
    serialNumber: 'AX-2024-014',
    substation: 'SE Industrial',
    feeder: 'Alimentador Leste',
    voltageClass: '138/13.8 kV',
    city: 'Uberaba',
  },
  {
    id: 'TRF-003',
    code: 'TRF-003',
    serialNumber: 'AX-2024-027',
    substation: 'SE Vale Azul',
    feeder: 'Alimentador Sul',
    voltageClass: '69/13.8 kV',
    city: 'Araguari',
  },
  {
    id: 'TRF-004',
    code: 'TRF-004',
    serialNumber: 'AX-2024-031',
    substation: 'SE Horizonte',
    feeder: 'Alimentador Oeste',
    voltageClass: '34.5/13.8 kV',
    city: 'Patos de Minas',
  },
];

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

function normalizeRecord(record: TransformerRecord | Omit<TransformerRecord, 'synchronizedAt'>): TransformerRecord {
  return {
    ...record,
    synchronizedAt: 'synchronizedAt' in record ? record.synchronizedAt : new Date().toISOString(),
  };
}

export function getSynchronizedTransformers() {
  const stored = readJson<TransformerRecord[]>(TRANSFORMERS_STORAGE_KEY) ?? [];
  return stored.map(normalizeRecord);
}

export function getTransformerById(id: string) {
  return getSynchronizedTransformers().find((item) => item.id === id) ?? null;
}

export function filterTransformers(records: TransformerRecord[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return records;
  }

  return records.filter((record) => {
    const haystack = [
      record.code,
      record.serialNumber,
      record.substation,
      record.feeder,
      record.city,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export async function fetchAvailableTransformers() {
  const endpoint = import.meta.env.VITE_TRANSFORMERS_API_URL;

  if (endpoint) {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error('Não foi possível consultar os transformadores na API.');
    }

    const payload = (await response.json()) as Array<Omit<TransformerRecord, 'synchronizedAt'>>;
    return payload.map(normalizeRecord);
  }

  return MOCK_TRANSFORMERS.map(normalizeRecord);
}

export async function synchronizeTransformers() {
  if (!(await hasNetworkConnection())) {
    throw new Error('Conecte-se à internet para sincronizar os transformadores.');
  }

  const records = await fetchAvailableTransformers();
  const synchronizedAt = new Date().toISOString();
  const persisted = records.map((record) => ({
    ...record,
    synchronizedAt,
  }));

  writeJson(TRANSFORMERS_STORAGE_KEY, persisted);
  return persisted;
}
