import type { AppData, ExpenseNote, Mission } from './types';
import { createSeedData } from './seed';

/** Clé de stockage imposée par le cahier des charges. */
export const STORAGE_KEY = 'notes-de-frais-v1';

function isMission(value: unknown): value is Mission {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    typeof m.clientName === 'string' &&
    (m.contractType === 'REGIE' || m.contractType === 'FORFAIT')
  );
}

function isNote(value: unknown): value is ExpenseNote {
  if (typeof value !== 'object' || value === null) return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === 'string' &&
    typeof n.date === 'string' &&
    typeof n.missionId === 'string' &&
    typeof n.category === 'string' &&
    typeof n.amount === 'number' &&
    typeof n.status === 'string'
  );
}

/**
 * Charge les données depuis `localStorage`. Au premier lancement (ou si les
 * données sont corrompues), retourne un jeu de données d'exemple.
 */
export function loadData(): AppData {
  if (typeof window === 'undefined') {
    return { missions: [], notes: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createSeedData();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) {
      return createSeedData();
    }
    const data = parsed as Record<string, unknown>;
    const missions = Array.isArray(data.missions) ? data.missions.filter(isMission) : [];
    const notes = Array.isArray(data.notes)
      ? data.notes.filter(isNote).map((n) => ({
          ...n,
          // Compatibilité : les notes sans override explicite passent en AUTO.
          rebillingOverride: n.rebillingOverride ?? 'AUTO',
        }))
      : [];
    return { missions, notes };
  } catch {
    return createSeedData();
  }
}

/** Persiste les données dans `localStorage`. */
export function saveData(data: AppData): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota dépassé ou stockage indisponible : on ignore silencieusement.
  }
}
