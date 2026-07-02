'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
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
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { useExpenseStore } from '@/store/ExpenseStore';
import {
  CATEGORY_LABELS,
  EXPENSE_STATUSES,
  EXPENSE_STATUS_LABELS,
  type ExpenseNote,
  type ExpenseStatus,
} from '@/lib/types';
import { resolveRebillable } from '@/lib/billing';
import { formatDate, formatEuros } from '@/lib/format';
import { buildExpensesCsv, csvFileName, selectNotesForExport } from '@/lib/csv';
import { triggerCsvDownload } from '@/lib/download';
import RebillingChip from './RebillingChip';
import ConfirmDialog from './ConfirmDialog';

type OrderBy = 'date' | 'client' | 'category' | 'amount' | 'status';
type Order = 'asc' | 'desc';

const STATUS_COLORS: Record<
  ExpenseStatus,
  'default' | 'info' | 'success' | 'error'
> = {
  BROUILLON: 'default',
  SOUMIS: 'info',
  VALIDE: 'success',
  REJETE: 'error',
};

interface ExpensesTableProps {
  onEdit: (note: ExpenseNote) => void;
}

export default function ExpensesTable({ onEdit }: ExpensesTableProps) {
  const { missions, notes, deleteNote } = useExpenseStore();

  const [missionFilter, setMissionFilter] = React.useState<string>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [orderBy, setOrderBy] = React.useState<OrderBy>('date');
  const [order, setOrder] = React.useState<Order>('desc');
  const [pendingDelete, setPendingDelete] = React.useState<ExpenseNote | null>(null);

  const missionById = React.useMemo(
    () => new Map(missions.map((m) => [m.id, m])),
    [missions],
  );

  const clientName = React.useCallback(
    (missionId: string) => missionById.get(missionId)?.clientName ?? 'Mission supprimée',
    [missionById],
  );

  const handleSort = (column: OrderBy) => {
    if (orderBy === column) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(column);
      setOrder('asc');
    }
  };

  const visibleNotes = React.useMemo(() => {
    const filtered = notes.filter((note) => {
      if (missionFilter !== 'ALL' && note.missionId !== missionFilter) return false;
      if (statusFilter !== 'ALL' && note.status !== statusFilter) return false;
      return true;
    });

    const direction = order === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (orderBy) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'client':
          comparison = clientName(a.missionId).localeCompare(
            clientName(b.missionId),
            'fr',
          );
          break;
        case 'category':
          comparison = CATEGORY_LABELS[a.category].localeCompare(
            CATEGORY_LABELS[b.category],
            'fr',
          );
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return comparison * direction;
    });
  }, [notes, missionFilter, statusFilter, orderBy, order, clientName]);

  // JIRA-102 : notes exportables (statut « Validé » + filtre mission courant).
  const exportableNotes = React.useMemo(
    () => selectNotesForExport(notes, missionFilter),
    [notes, missionFilter],
  );

  const handleExportCsv = React.useCallback(() => {
    const csv = buildExpensesCsv(exportableNotes, missions);
    triggerCsvDownload(csvFileName(), csv);
  }, [exportableNotes, missions]);

  const headCells: { id: OrderBy; label: string; align?: 'right' }[] = [
    { id: 'date', label: 'Date' },
    { id: 'client', label: 'Mission' },
    { id: 'category', label: 'Catégorie' },
    { id: 'amount', label: 'Montant', align: 'right' },
    { id: 'status', label: 'Statut' },
  ];

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems={{ sm: 'center' }}
      >
        <TextField
          label="Filtrer par mission"
          select
          size="small"
          value={missionFilter}
          onChange={(e) => setMissionFilter(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="ALL">Toutes les missions</MenuItem>
          {missions.map((mission) => (
            <MenuItem key={mission.id} value={mission.id}>
              {mission.clientName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Filtrer par statut"
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="ALL">Tous les statuts</MenuItem>
          {EXPENSE_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {EXPENSE_STATUS_LABELS[status]}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
          {visibleNotes.length} note(s) affichée(s)
        </Typography>
        <Tooltip
          title={
            exportableNotes.length === 0
              ? 'Aucune note validée à exporter pour cette sélection'
              : 'Exporter les notes validées au format CSV'
          }
        >
          <span>
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={handleExportCsv}
              disabled={exportableNotes.length === 0}
            >
              Exporter CSV ({exportableNotes.length})
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {notes.length === 0 ? (
        <Alert severity="info">
          Aucune note de frais enregistrée. Utilisez le formulaire ci-dessus pour en
          ajouter une.
        </Alert>
      ) : visibleNotes.length === 0 ? (
        <Alert severity="info">Aucune note ne correspond aux filtres sélectionnés.</Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {headCells.map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={cell.align}
                    sortDirection={orderBy === cell.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === cell.id}
                      direction={orderBy === cell.id ? order : 'asc'}
                      onClick={() => handleSort(cell.id)}
                    >
                      {cell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Refacturation</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleNotes.map((note) => {
                const mission = missionById.get(note.missionId);
                const rebillable = resolveRebillable(note, mission);
                return (
                  <TableRow key={note.id} hover>
                    <TableCell>{formatDate(note.date)}</TableCell>
                    <TableCell>{clientName(note.missionId)}</TableCell>
                    <TableCell>{CATEGORY_LABELS[note.category]}</TableCell>
                    <TableCell align="right">{formatEuros(note.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={EXPENSE_STATUS_LABELS[note.status]}
                        color={STATUS_COLORS[note.status]}
                        variant={note.status === 'BROUILLON' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell>
                      <RebillingChip
                        rebillable={rebillable}
                        override={note.rebillingOverride}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(note)}
                          aria-label="Modifier la note"
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setPendingDelete(note)}
                          aria-label="Supprimer la note"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer la note de frais ?"
        message={
          pendingDelete
            ? `La note du ${formatDate(pendingDelete.date)} (${formatEuros(
                pendingDelete.amount,
              )}) sera définitivement supprimée.`
            : ''
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteNote(pendingDelete.id);
          }
          setPendingDelete(null);
        }}
      />
    </>
  );
}
