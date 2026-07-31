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
export function primaryFamily(tags: string[]): Family {
  const priority: Family[] = ['outillage', 'plateforme', 'format', 'meta'];
  const seen = new Set(tags.map((t) => familyFor(t)));
  for (const f of priority) if (seen.has(f)) return f;
  return 'default';
}

export function placeholderFor(tags: string[]): string {
  return PLACEHOLDERS[primaryFamily(tags)];
}
