// Logique métier de refacturation et d'agrégation des notes de frais.
//
// Ces fonctions sont *pures* (aucun accès au DOM, au localStorage ou à React)
// afin d'être facilement testables et réutilisables.

import type {
  ContractType,
  ExpenseNote,
  Mission,
} from './types';

/**
 * Règle par défaut : une mission en **Régie** est refacturable au client,
 * une mission au **Forfait** est à la charge de l'entreprise.
 */
export function defaultRebillable(contractType: ContractType): boolean {
  return contractType === 'REGIE';
}

/**
 * Détermine si une note de frais est refacturable au client.
 *
 * L'override manuel de la note prime sur la règle par défaut :
 * - `REFACTURABLE`      → toujours refacturable ;
 * - `CHARGE_ENTREPRISE` → jamais refacturable ;
 * - `AUTO`              → dérivé du type de contrat de la mission.
 *
 * Si la mission est introuvable, seule la règle d'override explicite s'applique
 * (en mode `AUTO`, la note est considérée à la charge de l'entreprise).
 */
export function resolveRebillable(
  note: Pick<ExpenseNote, 'rebillingOverride'>,
  mission: Mission | undefined,
): boolean {
  switch (note.rebillingOverride) {
    case 'REFACTURABLE':
      return true;
    case 'CHARGE_ENTREPRISE':
      return false;
    case 'AUTO':
    default:
      return mission ? defaultRebillable(mission.contractType) : false;
  }
}

/** Indique si deux dates ISO (`AAAA-MM-JJ`) tombent dans le même mois calendaire. */
export function isSameMonth(iso: string, reference: Date = new Date()): boolean {
  const match = /^(\d{4})-(\d{2})/.exec(iso ?? '');
  if (!match) {
    return false;
  }
  const [, year, month] = match;
  return (
    Number(year) === reference.getFullYear() &&
    Number(month) === reference.getMonth() + 1
  );
}

/** Filtre les notes du mois de la date de référence (mois en cours par défaut). */
export function filterCurrentMonth(
  notes: ExpenseNote[],
  reference: Date = new Date(),
): ExpenseNote[] {
  return notes.filter((note) => isSameMonth(note.date, reference));
}

/** Somme les montants d'un ensemble de notes de frais. */
export function sumAmounts(notes: ExpenseNote[]): number {
  return notes.reduce((total, note) => total + (Number(note.amount) || 0), 0);
}

/** Total des montants par mission (clé = `missionId`). */
export function totalsByMission(notes: ExpenseNote[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const note of notes) {
    totals[note.missionId] = (totals[note.missionId] ?? 0) + (Number(note.amount) || 0);
  }
  return totals;
}

/** Synthèse de refacturation pour une mission. */
export interface MissionRebillingSummary {
  missionId: string;
  clientName: string;
  contractType: ContractType;
  /** Montant refacturable au client. */
  rebillable: number;
  /** Montant à la charge de l'entreprise. */
  companyBorne: number;
  /** Montant total (refacturable + à charge). */
  total: number;
}

/** Rapport de refacturation complet (par mission + cumul). */
export interface RebillingReport {
  perMission: MissionRebillingSummary[];
  totalRebillable: number;
  totalCompanyBorne: number;
  total: number;
}

/**
 * Construit le rapport de refacturation à partir d'un ensemble de notes et de
 * missions : ventilation par mission puis cumul (refacturable au client vs
 * à la charge de l'entreprise).
 *
 * Seules les missions ayant au moins une note dans l'ensemble fourni sont
 * incluses dans `perMission`.
 */
export function buildRebillingReport(
  notes: ExpenseNote[],
  missions: Mission[],
): RebillingReport {
  const missionById = new Map(missions.map((m) => [m.id, m]));
  const summaries = new Map<string, MissionRebillingSummary>();

  for (const note of notes) {
    const mission = missionById.get(note.missionId);
    const amount = Number(note.amount) || 0;

    let summary = summaries.get(note.missionId);
    if (!summary) {
      summary = {
        missionId: note.missionId,
        clientName: mission ? mission.clientName : 'Mission supprimée',
        contractType: mission ? mission.contractType : 'FORFAIT',
        rebillable: 0,
        companyBorne: 0,
        total: 0,
      };
      summaries.set(note.missionId, summary);
    }

    if (resolveRebillable(note, mission)) {
      summary.rebillable += amount;
    } else {
      summary.companyBorne += amount;
    }
    summary.total += amount;
  }

  const perMission = Array.from(summaries.values()).sort((a, b) =>
    a.clientName.localeCompare(b.clientName, 'fr'),
  );

  const totalRebillable = perMission.reduce((s, m) => s + m.rebillable, 0);
  const totalCompanyBorne = perMission.reduce((s, m) => s + m.companyBorne, 0);

  return {
    perMission,
    totalRebillable,
    totalCompanyBorne,
    total: totalRebillable + totalCompanyBorne,
  };
}

// ---------------------------------------------------------------------------
// Validation d'une note de frais
// ---------------------------------------------------------------------------

/** Données saisies dans le formulaire de note de frais (avant validation). */
export interface NoteFormInput {
  date: string;
  missionId: string;
  category: string;
  /** Montant saisi (chaîne du champ texte). */
  amount: string;
}

/**
 * Valide une saisie de note de frais et retourne la liste des messages
 * d'erreur (vide si la saisie est valide).
 *
 * Règle de l'entreprise : une note sans montant, catégorie ou mission est
 * rejetée avec un message d'erreur visible.
 */
export function validateNoteInput(input: NoteFormInput): string[] {
  const errors: string[] = [];

  if (!input.missionId) {
    errors.push('La mission est obligatoire.');
  }
  if (!input.category) {
    errors.push('La catégorie est obligatoire.');
  }

  const normalized = (input.amount ?? '').trim().replace(',', '.');
  const amount = Number(normalized);
  if (normalized === '' || Number.isNaN(amount)) {
    errors.push('Le montant est obligatoire.');
  } else if (amount <= 0) {
    errors.push('Le montant doit être strictement positif.');
  }

  if (!input.date) {
    errors.push('La date est obligatoire.');
  }

  return errors;
}

/** Convertit un montant saisi (`"12,50"` ou `"12.50"`) en nombre. */
export function parseAmount(raw: string): number {
  return Number((raw ?? '').trim().replace(',', '.'));
}
