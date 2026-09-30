import { slugify } from './slug';

export type Family = 'outillage' | 'plateforme' | 'meta' | 'format' | 'default';

const FAMILIES: Record<Family, string[]> = {
  outillage: ['prestaflow', 'tests', 'outils', 'ci-cd', 'github'],
  plateforme: ['prestashop', 'prestashop-9', 'prestashop-8'],
  meta: ['annonce', 'events'],
  format: ['tutoriel', 'prestashop-dev-conference', 'insomnia'],
  default: [],
};

const CHIPS: Record<Family, string> = {
  outillage: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  plateforme: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100',
  meta: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
  format: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100',
  default: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100',
};

const PLACEHOLDERS: Record<Family, string> = {
  outillage: '/placeholder-emerald.svg',
  plateforme: '/placeholder-orange.svg',
  meta: '/placeholder-slate.svg',
  format: '/placeholder-violet.svg',
  default: '/placeholder.svg',
};

export function familyFor(tag: string): Family {
  const s = slugify(tag);
  for (const [family, tags] of Object.entries(FAMILIES) as [Family, string[]][]) {
    if (tags.includes(s)) return family;
  }
  return 'default';
}

export function chipClass(tag: string): string {
  return CHIPS[familyFor(tag)];
}

/**
 * Chooses the dominant family for a set of tags.
 * Priority order matches the visual identity: outillage > plateforme > format > meta > default.
 */
/** Accents par famille, pour les surfaces plus grandes que les chips (cartes, bandeaux). */
const ACCENTS: Record<Family, { dot: string; bar: string; text: string; hover: string }> = {
  outillage: { dot: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-700', hover: 'hover:border-emerald-500/50' },
  plateforme: { dot: 'bg-orange-500', bar: 'bg-orange-500', text: 'text-orange-700', hover: 'hover:border-orange-500/50' },
  meta: { dot: 'bg-slate-500', bar: 'bg-slate-500', text: 'text-slate-700', hover: 'hover:border-slate-500/50' },
  format: { dot: 'bg-violet-500', bar: 'bg-violet-500', text: 'text-violet-700', hover: 'hover:border-violet-500/50' },
  default: { dot: 'bg-blue-500', bar: 'bg-blue-500', text: 'text-blue-700', hover: 'hover:border-blue-500/50' },
};

export function accentFor(tag: string) {
  return ACCENTS[familyFor(tag)];
}

export function primaryFamily(tags: string[]): Family {
  const priority: Family[] = ['outillage', 'plateforme', 'format', 'meta'];
  const seen = new Set(tags.map((t) => familyFor(t)));
  for (const f of priority) if (seen.has(f)) return f;
  return 'default';
}

export function placeholderFor(tags: string[]): string {
  return PLACEHOLDERS[primaryFamily(tags)];
}

/** Teintes Tailwind par famille, exposées en variables CSS pour les composants d'article. */
const ACCENT_STOPS = ['50', '100', '200', '500', '600', '700', '800'] as const;
const ACCENT_SHADES: Record<Family, string[]> = {
  outillage: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#10b981', '#059669', '#047857', '#065f46'],
  plateforme: ['#fff7ed', '#ffedd5', '#fed7aa', '#f97316', '#ea580c', '#c2410c', '#9a3412'],
  meta: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#64748b', '#475569', '#334155', '#1e293b'],
  format: ['#f5f3ff', '#ede9fe', '#ddd6fe', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
  default: ['#eff6ff', '#dbeafe', '#bfdbfe', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
};

/** `--accent-50: …; --accent-100: …` for the dominant family of the tags. */
export function accentStyle(tags: string[]): string {
  const shades = ACCENT_SHADES[primaryFamily(tags)];
  return ACCENT_STOPS.map((stop, i) => `--accent-${stop}: ${shades[i]}`).join('; ');
}
