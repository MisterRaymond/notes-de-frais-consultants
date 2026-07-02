'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { ExpenseStoreProvider, useExpenseStore } from '@/store/ExpenseStore';
import ExpensesPanel from '@/components/ExpensesPanel';
import MissionsPanel from '@/components/MissionsPanel';
import RebillingDashboard from '@/components/RebillingDashboard';

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function AppContent() {
  const { ready } = useExpenseStore();
  const [tab, setTab] = React.useState(0);

  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <ReceiptLongIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
            Notes de frais consultants
          </Typography>
        </Toolbar>
        <Tabs
          value={tab}
          onChange={(_, next) => setTab(next)}
          sx={{ px: 2, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Tab label="Notes de frais" />
          <Tab label="Missions" />
          <Tab label="Refacturation" />
        </Tabs>
      </AppBar>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {!ready ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tab} index={0}>
              <ExpensesPanel />
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <MissionsPanel />
            </TabPanel>
            <TabPanel value={tab} index={2}>
              <RebillingDashboard />
            </TabPanel>
          </>
        )}
      </Container>
    </>
  );
}

export default function HomePage() {
  return (
    <ExpenseStoreProvider>
      <AppContent />
    </ExpenseStoreProvider>
  );
}
