/**
 * Nom d'affichage d'une série. Le slug ne porte pas la casse de la marque
 * (prestaflow -> PrestaFlow) ; sans table, les pages affichaient « Prestaflow ».
 */
const LABELS: Record<string, string> = {
  prestaflow: 'PrestaFlow',
};

export function seriesLabel(slug: string): string {
  return LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}
