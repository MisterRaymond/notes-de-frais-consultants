'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useExpenseStore } from '@/store/ExpenseStore';
import { buildRebillingReport, filterCurrentMonth } from '@/lib/billing';
import { formatEuros } from '@/lib/format';
import { CONTRACT_TYPE_LABELS } from '@/lib/types';

const MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
});

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'primary' | 'text.primary';
}) {
  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5, color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function RebillingDashboard() {
  const { missions, notes } = useExpenseStore();

  const { report, monthLabel } = React.useMemo(() => {
    const reference = new Date();
    const monthNotes = filterCurrentMonth(notes, reference);
    return {
      report: buildRebillingReport(monthNotes, missions),
      monthLabel: MONTH_FORMATTER.format(reference),
    };
  }, [missions, notes]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">Refacturation — {monthLabel}</Typography>
        <Typography variant="body2" color="text.secondary">
          Par défaut, les missions en régie sont refacturables au client et les missions
          au forfait sont à la charge de l&apos;entreprise. Le statut peut être forcé note
          par note.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <MetricCard
          label="Refacturable aux clients"
          value={formatEuros(report.totalRebillable)}
          color="primary"
        />
        <MetricCard
          label="À la charge de l'entreprise"
          value={formatEuros(report.totalCompanyBorne)}
          color="text.primary"
        />
        <MetricCard
          label="Total du mois"
          value={formatEuros(report.total)}
          color="text.primary"
        />
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Détail par mission
          </Typography>
          {report.perMission.length === 0 ? (
            <Alert severity="info">
              Aucune note de frais ce mois-ci : rien à refacturer pour le moment.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Contrat</TableCell>
                    <TableCell align="right">Refacturable client</TableCell>
                    <TableCell align="right">Charge entreprise</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.perMission.map((row) => (
                    <TableRow key={row.missionId} hover>
                      <TableCell>{row.clientName}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={CONTRACT_TYPE_LABELS[row.contractType]}
                          color={row.contractType === 'REGIE' ? 'primary' : 'default'}
                          variant={row.contractType === 'REGIE' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {formatEuros(row.rebillable)}
                      </TableCell>
                      <TableCell align="right">{formatEuros(row.companyBorne)}</TableCell>
                      <TableCell align="right">{formatEuros(row.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Cumul du mois
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.95rem' }}
                    >
                      {formatEuros(report.totalRebillable)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}
                    >
                      {formatEuros(report.totalCompanyBorne)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}
                    >
                      {formatEuros(report.total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
