'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { useExpenseStore } from '@/store/ExpenseStore';
import {
  CONTRACT_TYPES,
  CONTRACT_TYPE_LABELS,
  type ContractType,
} from '@/lib/types';
import { formatEuros } from '@/lib/format';
import ConfirmDialog from './ConfirmDialog';

export default function MissionsPanel() {
  const { missions, notes, addMission, updateMission, deleteMission } = useExpenseStore();

  const [clientName, setClientName] = React.useState('');
  const [contractType, setContractType] = React.useState<ContractType>('REGIE');
  const [dailyRate, setDailyRate] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);

  const resetForm = () => {
    setClientName('');
    setContractType('REGIE');
    setDailyRate('');
    setEditingId(null);
    setError(null);
  };

  const startEdit = (id: string) => {
    const mission = missions.find((m) => m.id === id);
    if (!mission) return;
    setEditingId(id);
    setClientName(mission.clientName);
    setContractType(mission.contractType);
    setDailyRate(mission.dailyRate != null ? String(mission.dailyRate) : '');
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!clientName.trim()) {
      setError('Le nom du client est obligatoire.');
      return;
    }
    const rateRaw = dailyRate.trim().replace(',', '.');
    let rate: number | undefined;
    if (rateRaw !== '') {
      const parsed = Number(rateRaw);
      if (Number.isNaN(parsed) || parsed < 0) {
        setError('Le taux journalier doit être un nombre positif.');
        return;
      }
      rate = parsed;
    }

    const payload = { clientName: clientName.trim(), contractType, dailyRate: rate };
    if (editingId) {
      updateMission(editingId, payload);
    } else {
      addMission(payload);
    }
    resetForm();
  };

  const notesCountByMission = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const note of notes) {
      counts[note.missionId] = (counts[note.missionId] ?? 0) + 1;
    }
    return counts;
  }, [notes]);

  const missionToDelete = missions.find((m) => m.id === pendingDelete) ?? null;

  return (
    <Stack spacing={3}>
      <Card component="form" onSubmit={handleSubmit}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {editingId ? 'Modifier la mission' : 'Nouvelle mission'}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ md: 'flex-start' }}
          >
            <TextField
              label="Nom du client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Type de contrat"
              select
              value={contractType}
              onChange={(e) => setContractType(e.target.value as ContractType)}
              sx={{ minWidth: { md: 180 } }}
              fullWidth
            >
              {CONTRACT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {CONTRACT_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Taux journalier (€)"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              placeholder="Optionnel"
              inputProps={{ inputMode: 'decimal' }}
              sx={{ minWidth: { md: 180 } }}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained">
              {editingId ? 'Mettre à jour' : 'Ajouter la mission'}
            </Button>
            {editingId && (
              <Button type="button" onClick={resetForm} startIcon={<CloseIcon />}>
                Annuler
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Missions ({missions.length})
          </Typography>
          {missions.length === 0 ? (
            <Alert severity="info">
              Aucune mission pour l&apos;instant. Créez-en une pour pouvoir saisir des
              notes de frais.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Type de contrat</TableCell>
                    <TableCell align="right">Taux journalier</TableCell>
                    <TableCell align="right">Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {missions.map((mission) => (
                    <TableRow key={mission.id} hover>
                      <TableCell>{mission.clientName}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={CONTRACT_TYPE_LABELS[mission.contractType]}
                          color={mission.contractType === 'REGIE' ? 'primary' : 'default'}
                          variant={
                            mission.contractType === 'REGIE' ? 'filled' : 'outlined'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        {mission.dailyRate != null ? formatEuros(mission.dailyRate) : '—'}
                      </TableCell>
                      <TableCell align="right">
                        {notesCountByMission[mission.id] ?? 0}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => startEdit(mission.id)}
                            aria-label={`Modifier ${mission.clientName}`}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setPendingDelete(mission.id)}
                            aria-label={`Supprimer ${mission.clientName}`}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={missionToDelete !== null}
        title="Supprimer la mission ?"
        message={
          missionToDelete
            ? `La mission « ${missionToDelete.clientName} » sera supprimée` +
              ((notesCountByMission[missionToDelete.id] ?? 0) > 0
                ? `, ainsi que ${
                    notesCountByMission[missionToDelete.id] ?? 0
                  } note(s) de frais rattachée(s).`
                : '.')
            : ''
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            if (editingId === pendingDelete) {
              resetForm();
            }
            deleteMission(pendingDelete);
          }
          setPendingDelete(null);
        }}
      />
    </Stack>
  );
}
