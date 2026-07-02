// Formatage aux conventions françaises de l'entreprise.

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formate un montant en euros au format français : `1 234,56 €`.
 * Un montant invalide (NaN) est affiché comme `0,00 €`.
 */
export function formatEuros(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return euroFormatter.format(value);
}

/**
 * Formate une date ISO (`AAAA-MM-JJ`) au format français `JJ/MM/AAAA`.
 * Le parsing est fait manuellement pour éviter tout décalage de fuseau horaire.
 */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  if (!match) {
    return iso ?? '';
  }
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Retourne la date du jour au format ISO `AAAA-MM-JJ` (fuseau local). */
export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
