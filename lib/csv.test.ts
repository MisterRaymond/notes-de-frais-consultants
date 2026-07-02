import { describe, expect, it } from 'vitest';
import {
  buildExpensesCsv,
  csvFileName,
  formatAmountForCsv,
  selectNotesForExport,
} from './csv';
import type { ExpenseNote, Mission } from './types';

const missions: Mission[] = [
  { id: 'm1', clientName: 'ACME Banque', contractType: 'REGIE', dailyRate: 650 },
  { id: 'm2', clientName: 'Globex', contractType: 'FORFAIT' },
];

function note(overrides: Partial<ExpenseNote>): ExpenseNote {
  return {
    id: 'n',
    date: '2026-07-03',
    missionId: 'm1',
    category: 'TRANSPORT',
    amount: 10,
    status: 'VALIDE',
    rebillingOverride: 'AUTO',
    ...overrides,
  };
}

describe('selectNotesForExport', () => {
  const notes: ExpenseNote[] = [
    note({ id: 'a', status: 'VALIDE', missionId: 'm1' }),
    note({ id: 'b', status: 'SOUMIS', missionId: 'm1' }),
    note({ id: 'c', status: 'BROUILLON', missionId: 'm2' }),
    note({ id: 'd', status: 'VALIDE', missionId: 'm2' }),
    note({ id: 'e', status: 'REJETE', missionId: 'm1' }),
  ];

  it('ne conserve que les notes au statut Validé', () => {
    const result = selectNotesForExport(notes, 'ALL');
    expect(result.map((n) => n.id)).toEqual(['a', 'd']);
  });

  it('respecte le filtre par mission actif', () => {
    const result = selectNotesForExport(notes, 'm1');
    expect(result.map((n) => n.id)).toEqual(['a']);
  });

  it('retourne un tableau vide si aucune note validée pour la mission', () => {
    const result = selectNotesForExport(notes, 'm2');
    expect(result.map((n) => n.id)).toEqual(['d']);
  });
});

describe('formatAmountForCsv', () => {
  it('formate avec une virgule décimale et deux décimales', () => {
    expect(formatAmountForCsv(84.9)).toBe('84,90');
    expect(formatAmountForCsv(1234.5)).toBe('1234,50');
    expect(formatAmountForCsv(0)).toBe('0,00');
  });
});

describe('csvFileName', () => {
  it('suit le format export-notes-de-frais-JJMMAAAA.csv', () => {
    expect(csvFileName(new Date('2026-07-02T10:00:00'))).toBe(
      'export-notes-de-frais-02072026.csv',
    );
  });
});

describe('buildExpensesCsv', () => {
  it('génère un en-tête avec les 6 colonnes attendues', () => {
    const csv = buildExpensesCsv([], missions);
    expect(csv.split('\r\n')[0]).toBe(
      'Date;Mission;Client;Catégorie;Montant;Statut de refacturation',
    );
  });

  it('produit la ligne attendue pour une note en régie (refacturable au client)', () => {
    const csv = buildExpensesCsv(
      [note({ missionId: 'm1', amount: 84.9, date: '2026-07-03' })],
      missions,
    );
    const line = csv.split('\r\n')[1];
    expect(line).toBe(
      '03/07/2026;ACME Banque (Régie);ACME Banque;Transport;84,90;Refacturable au client',
    );
  });

  it("marque une note au forfait à la charge de l'entreprise par défaut", () => {
    const csv = buildExpensesCsv(
      [note({ missionId: 'm2', category: 'HEBERGEMENT', amount: 129 })],
      missions,
    );
    expect(csv).toContain("Globex (Forfait);Globex;Hébergement;129,00;À la charge de l'entreprise");
  });

  it('respecte le forçage manuel de refacturation', () => {
    const csv = buildExpensesCsv(
      [note({ missionId: 'm2', amount: 47.2, rebillingOverride: 'REFACTURABLE' })],
      missions,
    );
    expect(csv).toContain('47,20;Refacturable au client');
  });

  it('trie les lignes par date croissante', () => {
    const csv = buildExpensesCsv(
      [
        note({ id: 'late', date: '2026-07-20', amount: 2 }),
        note({ id: 'early', date: '2026-07-01', amount: 1 }),
      ],
      missions,
    );
    const lines = csv.split('\r\n');
    expect(lines[1]).toContain('01/07/2026');
    expect(lines[2]).toContain('20/07/2026');
  });

  it('échappe les champs contenant le séparateur point-virgule', () => {
    const trickyMissions: Mission[] = [
      { id: 'm3', clientName: 'Dupont; Fils', contractType: 'REGIE' },
    ];
    const csv = buildExpensesCsv([note({ missionId: 'm3' })], trickyMissions);
    expect(csv).toContain('"Dupont; Fils (Régie)";"Dupont; Fils"');
  });
});
