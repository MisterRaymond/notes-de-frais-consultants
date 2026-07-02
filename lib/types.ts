// Types et constantes du domaine métier « notes de frais consultants ».

/** Mode de contrat d'une mission. */
export type ContractType = 'REGIE' | 'FORFAIT';

/** Catégorie d'une note de frais. */
export type Category = 'TRANSPORT' | 'REPAS' | 'HEBERGEMENT' | 'AUTRE';

/** Statut de traitement d'une note de frais. */
export type ExpenseStatus = 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'REJETE';

/**
 * Décision de refacturation pour une note.
 * - `AUTO`  : dérivée du type de contrat de la mission (règle par défaut).
 * - `REFACTURABLE`      : forcée « refacturable au client ».
 * - `CHARGE_ENTREPRISE` : forcée « à la charge de l'entreprise ».
 */
export type RebillingOverride = 'AUTO' | 'REFACTURABLE' | 'CHARGE_ENTREPRISE';

/** Une mission : un client + un type de contrat. */
export interface Mission {
  id: string;
  clientName: string;
  contractType: ContractType;
  /** Taux journalier en euros (optionnel). */
  dailyRate?: number;
}

/** Une note de frais rattachée à une mission. */
export interface ExpenseNote {
  id: string;
  /** Date au format ISO `AAAA-MM-JJ`. */
  date: string;
  missionId: string;
  category: Category;
  /** Montant en euros. */
  amount: number;
  status: ExpenseStatus;
  rebillingOverride: RebillingOverride;
}

/** Ensemble des données persistées. */
export interface AppData {
  missions: Mission[];
  notes: ExpenseNote[];
}

// ---------------------------------------------------------------------------
// Libellés d'affichage (français)
// ---------------------------------------------------------------------------

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  REGIE: 'Régie',
  FORFAIT: 'Forfait',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  TRANSPORT: 'Transport',
  REPAS: 'Repas',
  HEBERGEMENT: 'Hébergement',
  AUTRE: 'Autre',
};

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  BROUILLON: 'Brouillon',
  SOUMIS: 'Soumis',
  VALIDE: 'Validé',
  REJETE: 'Rejeté',
};

export const REBILLING_OVERRIDE_LABELS: Record<RebillingOverride, string> = {
  AUTO: 'Automatique',
  REFACTURABLE: 'Forcé refacturable',
  CHARGE_ENTREPRISE: "Forcé à la charge de l'entreprise",
};

export const CONTRACT_TYPES: ContractType[] = ['REGIE', 'FORFAIT'];
export const CATEGORIES: Category[] = ['TRANSPORT', 'REPAS', 'HEBERGEMENT', 'AUTRE'];
export const EXPENSE_STATUSES: ExpenseStatus[] = [
  'BROUILLON',
  'SOUMIS',
  'VALIDE',
  'REJETE',
];
export const REBILLING_OVERRIDES: RebillingOverride[] = [
  'AUTO',
  'REFACTURABLE',
  'CHARGE_ENTREPRISE',
];
