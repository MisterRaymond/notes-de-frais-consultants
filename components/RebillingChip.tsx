'use client';

import * as React from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { REBILLING_OVERRIDE_LABELS, type RebillingOverride } from '@/lib/types';

interface RebillingChipProps {
  rebillable: boolean;
  override: RebillingOverride;
}

/**
 * Badge indiquant le statut de refacturation d'une note de frais.
 * Couleur bleue (accent) si refacturable au client, grise si à la charge de
 * l'entreprise. Une bordure signale un statut forcé manuellement.
 */
export default function RebillingChip({ rebillable, override }: RebillingChipProps) {
  const isManual = override !== 'AUTO';
  const chip = (
    <Chip
      size="small"
      label={rebillable ? 'Refacturable au client' : "À la charge de l'entreprise"}
      color={rebillable ? 'primary' : 'default'}
      variant={isManual ? 'outlined' : 'filled'}
    />
  );

  if (!isManual) {
    return chip;
  }
  return (
    <Tooltip title={REBILLING_OVERRIDE_LABELS[override]}>
      <span>{chip}</span>
    </Tooltip>
  );
}
