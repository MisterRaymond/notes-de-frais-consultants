import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ExpensesTable from './ExpensesTable';
import { ExpenseStoreProvider } from '@/store/ExpenseStore';
import { STORAGE_KEY } from '@/lib/storage';
import { triggerCsvDownload } from '@/lib/download';
import type { AppData } from '@/lib/types';

// On isole le déclenchement du téléchargement pour inspecter le CSV généré.
vi.mock('@/lib/download', () => ({ triggerCsvDownload: vi.fn() }));

const data: AppData = {
  missions: [
    { id: 'm1', clientName: 'ACME Banque', contractType: 'REGIE', dailyRate: 650 },
    { id: 'm2', clientName: 'Globex', contractType: 'FORFAIT' },
  ],
  notes: [
    {
      id: 'n1',
      date: '2026-07-03',
      missionId: 'm1',
      category: 'TRANSPORT',
      amount: 84.9,
      status: 'VALIDE',
      rebillingOverride: 'AUTO',
    },
    {
      id: 'n2',
      date: '2026-07-04',
      missionId: 'm1',
      category: 'REPAS',
      amount: 23.5,
      status: 'SOUMIS', // non validée : ne doit jamais être exportée
      rebillingOverride: 'AUTO',
    },
    {
      id: 'n3',
      date: '2026-07-06',
      missionId: 'm2',
      category: 'HEBERGEMENT',
      amount: 129,
      status: 'VALIDE',
      rebillingOverride: 'AUTO',
    },
    {
      id: 'n4',
      date: '2026-07-08',
      missionId: 'm2',
      category: 'TRANSPORT',
      amount: 47.2,
      status: 'VALIDE',
      rebillingOverride: 'REFACTURABLE',
    },
  ],
};

function renderTable() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return render(
    <ExpenseStoreProvider>
      <ExpensesTable onEdit={() => {}} />
    </ExpenseStoreProvider>,
  );
}

describe('Export CSV (JIRA-102)', () => {
  beforeEach(() => {
    vi.mocked(triggerCsvDownload).mockClear();
  });

  it("exporte uniquement les notes validées et déclenche le téléchargement", async () => {
    const user = userEvent.setup();
    renderTable();

    // 3 notes validées sur 4 → le compteur du bouton le reflète.
    const exportButton = await screen.findByRole('button', {
      name: /Exporter CSV \(3\)/,
    });
    await user.click(exportButton);

    expect(triggerCsvDownload).toHaveBeenCalledTimes(1);
    const [fileName, csv] = vi.mocked(triggerCsvDownload).mock.calls[0];

    expect(fileName).toMatch(/^export-notes-de-frais-\d{8}\.csv$/);

    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(4); // en-tête + 3 notes validées
    expect(csv).toContain('84,90;Refacturable au client');
    expect(csv).toContain("129,00;À la charge de l'entreprise");
    expect(csv).toContain('47,20;Refacturable au client');
    // La note « Soumis » (23,50 €) est exclue de l'export.
    expect(csv).not.toContain('23,50');
  });

  it("limite l'export à la mission lorsqu'un filtre par mission est actif", async () => {
    const user = userEvent.setup();
    renderTable();

    await screen.findByRole('button', { name: /Exporter CSV \(3\)/ });

    // Filtre sur la mission ACME Banque (m1).
    await user.click(screen.getByRole('combobox', { name: 'Filtrer par mission' }));
    await user.click(await screen.findByRole('option', { name: 'ACME Banque' }));

    const exportButton = await screen.findByRole('button', {
      name: /Exporter CSV \(1\)/,
    });
    await user.click(exportButton);

    const [, csv] = vi.mocked(triggerCsvDownload).mock.calls[0];
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(2); // en-tête + 1 note validée de la mission
    expect(csv).toContain('ACME Banque');
    expect(csv).not.toContain('Globex');
  });
});
