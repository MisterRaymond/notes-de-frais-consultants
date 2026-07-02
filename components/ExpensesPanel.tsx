'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { ExpenseNote } from '@/lib/types';
import SummaryCards from './SummaryCards';
import ExpenseForm from './ExpenseForm';
import ExpensesTable from './ExpensesTable';

export default function ExpensesPanel() {
  const [editing, setEditing] = React.useState<ExpenseNote | null>(null);

  const handleEdit = (note: ExpenseNote) => {
    setEditing(note);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Stack spacing={3}>
      <SummaryCards />
      <ExpenseForm editing={editing} onDone={() => setEditing(null)} />
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notes de frais
          </Typography>
          <ExpensesTable onEdit={handleEdit} />
        </CardContent>
      </Card>
    </Stack>
  );
}
