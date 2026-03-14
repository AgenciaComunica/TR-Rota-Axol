import { hasNetworkConnection } from './network';

export interface InspectionFormRecord {
  id: string;
  transformerId: string;
  transformerCode: string;
  createdAt: string;
  synchronizedAt: string | null;
  accessStatus: string;
  identificationStatus: string;
  tagCondition: string;
  oilTemperature: string;
  windingTemperature: string;
  ambientTemperature: string;
  primaryConnection: string;
  secondaryConnection: string;
  groundingStatus: string;
  operationStatus: string;
  coolingStatus: string;
  activeAlarmStatus: string;
}

const INSPECTIONS_STORAGE_KEY = 'tr-rota:inspections';

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

export function getStoredInspections() {
  const stored = readJson<InspectionFormRecord[]>(INSPECTIONS_STORAGE_KEY) ?? [];

  return stored.map((record) => ({
    ...record,
    synchronizedAt: record.synchronizedAt ?? null,
  }));
}

export function getInspectionById(id: string) {
  return getStoredInspections().find((record) => record.id === id) ?? null;
}

export function saveInspection(
  payload: Omit<InspectionFormRecord, 'id' | 'createdAt' | 'synchronizedAt'>,
) {
  const inspections = getStoredInspections();
  const record: InspectionFormRecord = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    synchronizedAt: null,
  };

  inspections.unshift(record);
  writeJson(INSPECTIONS_STORAGE_KEY, inspections);
  return record;
}

export function updateInspection(
  id: string,
  payload: Omit<InspectionFormRecord, 'id' | 'createdAt' | 'synchronizedAt'>,
) {
  const inspections = getStoredInspections();
  const index = inspections.findIndex((record) => record.id === id);

  if (index === -1) {
    throw new Error('Inspeção não encontrada para edição.');
  }

  if (inspections[index].synchronizedAt) {
    throw new Error('A inspeção já foi sincronizada e não pode ser editada.');
  }

  const updatedRecord: InspectionFormRecord = {
    ...inspections[index],
    ...payload,
  };

  inspections.splice(index, 1, updatedRecord);
  writeJson(INSPECTIONS_STORAGE_KEY, inspections);
  return updatedRecord;
}

export function deleteInspection(id: string) {
  const inspections = getStoredInspections();
  const record = inspections.find((item) => item.id === id);

  if (!record) {
    throw new Error('Inspeção não encontrada para exclusão.');
  }

  if (record.synchronizedAt) {
    throw new Error('A inspeção já foi sincronizada e não pode ser removida.');
  }

  const filtered = inspections.filter((item) => item.id !== id);
  writeJson(INSPECTIONS_STORAGE_KEY, filtered);
  return filtered;
}

export function getSynchronizedInspectionsCount() {
  return getStoredInspections().filter((record) => Boolean(record.synchronizedAt)).length;
}

export async function synchronizeInspections() {
  if (!(await hasNetworkConnection())) {
    throw new Error('Conecte-se à internet para sincronizar as inspeções.');
  }

  const inspections = getStoredInspections();
  const pending = inspections.filter((record) => !record.synchronizedAt);

  if (pending.length === 0) {
    return inspections;
  }

  const endpoint = import.meta.env.VITE_INSPECTIONS_SYNC_API_URL;

  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspections: pending,
      }),
    });

    if (!response.ok) {
      throw new Error('Não foi possível sincronizar as inspeções na API.');
    }
  } else {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
  }

  const synchronizedAt = new Date().toISOString();
  const updated = inspections.map((record) => ({
    ...record,
    synchronizedAt: record.synchronizedAt ?? synchronizedAt,
  }));

  writeJson(INSPECTIONS_STORAGE_KEY, updated);
  return updated;
}
