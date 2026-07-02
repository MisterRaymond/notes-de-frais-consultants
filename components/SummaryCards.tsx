'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useExpenseStore } from '@/store/ExpenseStore';
import { filterCurrentMonth, sumAmounts, totalsByMission } from '@/lib/billing';
import { formatEuros } from '@/lib/format';

const MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
});

/** Cartes de synthèse du Module 1 : total du mois en cours et total par mission. */
export default function SummaryCards() {
  const { missions, notes } = useExpenseStore();

  const { monthTotal, perMission, monthLabel } = React.useMemo(() => {
    const reference = new Date();
    const monthNotes = filterCurrentMonth(notes, reference);
    const totals = totalsByMission(monthNotes);
    const perMission = missions
      .map((mission) => ({
        mission,
        total: totals[mission.id] ?? 0,
      }))
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total);
    return {
      monthTotal: sumAmounts(monthNotes),
      perMission,
      monthLabel: MONTH_FORMATTER.format(reference),
    };
  }, [missions, notes]);

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems="stretch"
      sx={{ mb: 3 }}
    >
      <Card sx={{ flex: { md: '0 0 300px' } }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Total du mois en cours
          </Typography>
          <Typography variant="h4" color="primary" sx={{ mt: 0.5 }}>
            {formatEuros(monthTotal)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {monthLabel}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Total par mission (mois en cours)
          </Typography>
          {perMission.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Aucune note de frais ce mois-ci.
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} sx={{ mt: 1 }}>
              {perMission.map(({ mission, total }) => (
                <Box
                  key={mission.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    py: 0.75,
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" noWrap>
                    {mission.clientName}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatEuros(total)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
