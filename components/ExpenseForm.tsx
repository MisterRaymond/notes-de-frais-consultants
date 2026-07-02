'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import { useExpenseStore } from '@/store/ExpenseStore';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  EXPENSE_STATUSES,
  EXPENSE_STATUS_LABELS,
  REBILLING_OVERRIDES,
  REBILLING_OVERRIDE_LABELS,
  type Category,
  type ExpenseNote,
  type ExpenseStatus,
  type RebillingOverride,
} from '@/lib/types';
import { parseAmount, resolveRebillable, validateNoteInput } from '@/lib/billing';
import { todayIso } from '@/lib/format';

interface ExpenseFormProps {
  editing: ExpenseNote | null;
  onDone: () => void;
}

const emptyForm = () => ({
  date: todayIso(),
  missionId: '',
  category: '' as Category | '',
  amount: '',
  status: 'BROUILLON' as ExpenseStatus,
  rebillingOverride: 'AUTO' as RebillingOverride,
});

export default function ExpenseForm({ editing, onDone }: ExpenseFormProps) {
  const { missions, addNote, updateNote } = useExpenseStore();
  const [form, setForm] = React.useState(emptyForm);
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (editing) {
      setForm({
        date: editing.date,
        missionId: editing.missionId,
        category: editing.category,
        amount: String(editing.amount),
        status: editing.status,
        rebillingOverride: editing.rebillingOverride,
      });
      setErrors([]);
    } else {
      setForm(emptyForm());
      setErrors([]);
    }
  }, [editing]);

  const selectedMission = missions.find((m) => m.id === form.missionId);
  const rebillablePreview = form.missionId
    ? resolveRebillable({ rebillingOverride: form.rebillingOverride }, selectedMission)
    : null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateNoteInput({
      date: form.date,
      missionId: form.missionId,
      category: form.category,
      amount: form.amount,
    });
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      date: form.date,
      missionId: form.missionId,
      category: form.category as Category,
      amount: parseAmount(form.amount),
      status: form.status,
      rebillingOverride: form.rebillingOverride,
    };

    if (editing) {
      updateNote(editing.id, payload);
    } else {
      addNote(payload);
    }
    onDone();
    setForm(emptyForm());
    setErrors([]);
  };

  const noMission = missions.length === 0;

  return (
    <Card component="form" onSubmit={handleSubmit}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {editing ? 'Modifier la note de frais' : 'Nouvelle note de frais'}
        </Typography>

        {noMission && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Créez d&apos;abord une mission dans l&apos;onglet « Missions » pour pouvoir
            saisir une note de frais.
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrors([])}>
            <AlertTitle>Note de frais rejetée</AlertTitle>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Mission"
              select
              value={form.missionId}
              onChange={(e) => setForm((f) => ({ ...f, missionId: e.target.value }))}
              disabled={noMission}
              fullWidth
              required
            >
              {missions.map((mission) => (
                <MenuItem key={mission.id} value={mission.id}>
                  {mission.clientName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Catégorie"
              select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as Category }))
              }
              fullWidth
              required
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Montant (€)"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              inputProps={{ inputMode: 'decimal' }}
              fullWidth
              required
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Statut"
              select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as ExpenseStatus }))
              }
              fullWidth
            >
              {EXPENSE_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {EXPENSE_STATUS_LABELS[status]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Refacturation"
              select
              value={form.rebillingOverride}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  rebillingOverride: e.target.value as RebillingOverride,
                }))
              }
              helperText={
                rebillablePreview === null
                  ? 'Automatique selon le contrat de la mission'
                  : rebillablePreview
                    ? 'Cette note sera refacturable au client'
                    : "Cette note sera à la charge de l'entreprise"
              }
              fullWidth
            >
              {REBILLING_OVERRIDES.map((override) => (
                <MenuItem key={override} value={override}>
                  {REBILLING_OVERRIDE_LABELS[override]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={noMission}>
              {editing ? 'Mettre à jour' : 'Ajouter la note'}
            </Button>
            {editing && (
              <Button type="button" onClick={onDone} startIcon={<CloseIcon />}>
                Annuler
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
