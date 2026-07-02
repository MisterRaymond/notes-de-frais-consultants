// Déclenche le téléchargement d'un fichier CSV côté navigateur.
// Isolé du calcul du contenu (lib/csv.ts) pour garder ce dernier testable.

/** Marqueur d'ordre des octets UTF-8, pour que Excel interprète bien les accents. */
const UTF8_BOM = '﻿';

/** Crée un fichier CSV et déclenche son téléchargement dans le navigateur. */
export function triggerCsvDownload(fileName: string, csvContent: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  const blob = new Blob([UTF8_BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
