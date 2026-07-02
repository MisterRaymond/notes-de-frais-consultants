'use client';

import { createTheme } from '@mui/material/styles';
import { frFR } from '@mui/material/locale';

// Thème de l'entreprise : une seule couleur d'accent, pas de dégradés.
const ACCENT = '#2563EB';

const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: {
        main: ACCENT,
      },
      background: {
        default: '#F4F6FB',
        paper: '#FFFFFF',
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: [
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif',
      ].join(','),
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: { borderColor: '#E3E8F0' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
    },
  },
  frFR,
);

export default theme;
