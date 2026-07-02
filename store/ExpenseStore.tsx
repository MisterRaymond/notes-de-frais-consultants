'use client';

import * as React from 'react';
import type { AppData, ExpenseNote, Mission } from '@/lib/types';
import { loadData, saveData } from '@/lib/storage';

interface ExpenseStore {
  ready: boolean;
  missions: Mission[];
  notes: ExpenseNote[];
  addMission: (mission: Omit<Mission, 'id'>) => Mission;
  updateMission: (id: string, changes: Partial<Omit<Mission, 'id'>>) => void;
  deleteMission: (id: string) => void;
  addNote: (note: Omit<ExpenseNote, 'id'>) => ExpenseNote;
  updateNote: (id: string, changes: Partial<Omit<ExpenseNote, 'id'>>) => void;
  deleteNote: (id: string) => void;
}

import { newId } from '@/lib/id';

const ExpenseStoreContext = React.createContext<ExpenseStore | null>(null);

export function ExpenseStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<AppData>({ missions: [], notes: [] });
  const [ready, setReady] = React.useState(false);

  // Hydratation depuis localStorage, uniquement côté client.
  React.useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  // Persistance à chaque modification (une fois l'hydratation terminée).
  React.useEffect(() => {
    if (ready) {
      saveData(data);
    }
  }, [data, ready]);

  const addMission = React.useCallback((mission: Omit<Mission, 'id'>) => {
    const created: Mission = { ...mission, id: newId('mission') };
    setData((prev) => ({ ...prev, missions: [...prev.missions, created] }));
    return created;
  }, []);

  const updateMission = React.useCallback(
    (id: string, changes: Partial<Omit<Mission, 'id'>>) => {
      setData((prev) => ({
        ...prev,
        missions: prev.missions.map((m) => (m.id === id ? { ...m, ...changes } : m)),
      }));
    },
    [],
  );

  const deleteMission = React.useCallback((id: string) => {
    // Suppression en cascade : les notes rattachées à la mission sont retirées.
    setData((prev) => ({
      missions: prev.missions.filter((m) => m.id !== id),
      notes: prev.notes.filter((n) => n.missionId !== id),
    }));
  }, []);

  const addNote = React.useCallback((note: Omit<ExpenseNote, 'id'>) => {
    const created: ExpenseNote = { ...note, id: newId('note') };
    setData((prev) => ({ ...prev, notes: [...prev.notes, created] }));
    return created;
  }, []);

  const updateNote = React.useCallback(
    (id: string, changes: Partial<Omit<ExpenseNote, 'id'>>) => {
      setData((prev) => ({
        ...prev,
        notes: prev.notes.map((n) => (n.id === id ? { ...n, ...changes } : n)),
      }));
    },
    [],
  );

  const deleteNote = React.useCallback((id: string) => {
    setData((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
  }, []);

  const value = React.useMemo<ExpenseStore>(
    () => ({
      ready,
      missions: data.missions,
      notes: data.notes,
      addMission,
      updateMission,
      deleteMission,
      addNote,
      updateNote,
      deleteNote,
    }),
    [
      ready,
      data.missions,
      data.notes,
      addMission,
      updateMission,
      deleteMission,
      addNote,
      updateNote,
      deleteNote,
    ],
  );

  return (
    <ExpenseStoreContext.Provider value={value}>{children}</ExpenseStoreContext.Provider>
  );
}

/** Accès au store partagé des notes de frais. */
export function useExpenseStore(): ExpenseStore {
  const ctx = React.useContext(ExpenseStoreContext);
  if (!ctx) {
    throw new Error('useExpenseStore doit être utilisé dans un ExpenseStoreProvider.');
  }
  return ctx;
}
