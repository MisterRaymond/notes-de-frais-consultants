import * as React from 'react';
import type { Metadata } from 'next';
import ThemeRegistry from './ThemeRegistry';

export const metadata: Metadata = {
  title: 'Notes de frais consultants',
  description:
    'Gestion des notes de frais et refacturation client (régie / forfait) pour consultants.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
