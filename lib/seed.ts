import type { AppData } from './types';

/**
 * Jeu de données d'exemple, généré au premier lancement (localStorage vide),
 * pour que les tableaux et le tableau de bord de refacturation ne soient pas
 * vides lors de la découverte de l'application. Les dates sont calées sur le
 * mois de référence afin d'alimenter les totaux « du mois en cours ».
 */
export function createSeedData(reference: Date = new Date()): AppData {
  const year = reference.getFullYear();
  const month = String(reference.getMonth() + 1).padStart(2, '0');
  const day = (d: number) => `${year}-${month}-${String(d).padStart(2, '0')}`;

  return {
    missions: [
      {
        id: 'mission_regie_acme',
        clientName: 'ACME Banque',
        contractType: 'REGIE',
        dailyRate: 650,
      },
      {
        id: 'mission_forfait_globex',
        clientName: 'Globex Industries',
        contractType: 'FORFAIT',
        dailyRate: undefined,
      },
    ],
    notes: [
      {
        id: 'note_1',
        date: day(3),
        missionId: 'mission_regie_acme',
        category: 'TRANSPORT',
        amount: 84.9,
        status: 'VALIDE',
        rebillingOverride: 'AUTO',
      },
      {
        id: 'note_2',
        date: day(4),
        missionId: 'mission_regie_acme',
        category: 'REPAS',
        amount: 23.5,
        status: 'SOUMIS',
        rebillingOverride: 'AUTO',
      },
      {
        id: 'note_3',
        date: day(6),
        missionId: 'mission_forfait_globex',
        category: 'HEBERGEMENT',
        amount: 129,
        status: 'VALIDE',
        rebillingOverride: 'AUTO',
      },
      {
        id: 'note_4',
        date: day(8),
        missionId: 'mission_forfait_globex',
        category: 'TRANSPORT',
        amount: 47.2,
        // Exception commerciale : refacturée au client malgré le forfait.
        status: 'VALIDE',
        rebillingOverride: 'REFACTURABLE',
      },
    ],
  };
}
