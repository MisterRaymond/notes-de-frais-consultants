// JIRA-102 — Export CSV des notes de frais validées.
//
// Logique *pure* de construction du CSV (aucun accès au DOM), afin d'être
// testable indépendamment du déclenchement du téléchargement.

import {
  CATEGORY_LABELS,
  CONTRACT_TYPE_LABELS,
  type ExpenseNote,
  type Mission,
} from './types';
import { resolveRebillable } from './billing';
import { formatDate } from './format';

/** Séparateur de colonnes : point-virgule (convention CSV française / Excel). */
const DELIMITER = ';';
/** Fin de ligne CRLF pour une ouverture correcte dans Excel. */
const EOL = '\r\n';

export const CSV_HEADERS = [
  'Date',
  'Mission',
  'Client',
  'Catégorie',
  'Montant',
  'Statut de refacturation',
] as const;

/**
 * Sélectionne les notes à exporter : uniquement le statut « Validé », et si un
 * filtre par mission est actif (≠ `ALL`), uniquement cette mission.
 */
export function selectNotesForExport(
  notes: ExpenseNote[],
  missionFilter: string = 'ALL',
): ExpenseNote[] {
  return notes
    .filter((note) => note.status === 'VALIDE')
    .filter((note) => missionFilter === 'ALL' || note.missionId === missionFilter);
}

/** Formate un montant pour le CSV : décimale à la virgule, 2 chiffres, sans symbole. */
export function formatAmountForCsv(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return value.toFixed(2).replace('.', ',');
}

/** Échappe un champ CSV s'il contient le séparateur, un guillemet ou un saut de ligne. */
function escapeField(value: string): string {
  if (/[";\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Construit le contenu CSV des notes fournies.
 * Colonnes : Date, Mission, Client, Catégorie, Montant, Statut de refacturation.
 *
 * Le modèle métier ne comporte pas de « nom de mission » distinct : la colonne
 * Mission est dérivée en « Client (Type de contrat) », la colonne Client
 * contient le nom du client seul.
 */
export function buildExpensesCsv(notes: ExpenseNote[], missions: Mission[]): string {
  const missionById = new Map(missions.map((m) => [m.id, m]));

  const sorted = [...notes].sort((a, b) => a.date.localeCompare(b.date));

  const rows = sorted.map((note) => {
    const mission = missionById.get(note.missionId);
    const client = mission ? mission.clientName : 'Mission supprimée';
    const missionLabel = mission
      ? `${client} (${CONTRACT_TYPE_LABELS[mission.contractType]})`
      : client;
    const rebillable = resolveRebillable(note, mission);

    return [
      formatDate(note.date),
      missionLabel,
      client,
      CATEGORY_LABELS[note.category],
      formatAmountForCsv(note.amount),
      rebillable ? 'Refacturable au client' : "À la charge de l'entreprise",
    ]
      .map((field) => escapeField(String(field)))
      .join(DELIMITER);
  });

  return [CSV_HEADERS.join(DELIMITER), ...rows].join(EOL);
}

/** Nom de fichier de l'export : `export-notes-de-frais-JJMMAAAA.csv`. */
export function csvFileName(reference: Date = new Date()): string {
  const day = String(reference.getDate()).padStart(2, '0');
  const month = String(reference.getMonth() + 1).padStart(2, '0');
  const year = reference.getFullYear();
  return `export-notes-de-frais-${day}${month}${year}.csv`;
}
