# Layout d'article riche — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner aux articles du blog un layout riche optionnel (hero sombre, parcours, fiches, bancs d'essai, code avec nom de fichier) aux couleurs du blog, et l'appliquer à l'article hooks 9.2.

**Architecture:** Un bloc `hero` facultatif dans le frontmatter bascule la page article sur un en-tête sombre. Des variables CSS `--accent-*`, calculées depuis la famille des tags, sont posées sur chaque `<article>`. Cinq composants MDX génériques les consomment. Un transformer Shiki ajoute un bandeau « nom de fichier » aux blocs de code qui ont `title="…"`.

**Tech Stack:** Astro 5.18, MDX, Tailwind v4 + `@tailwindcss/typography`, Shiki (via `markdown.shikiConfig`).

**Spec:** `docs/superpowers/specs/2026-09-30-layout-article-riche-design.md`

---

## Conventions pour tout le plan

- Toutes les commandes se lancent depuis `poc-astro/` (`cd /Users/jonathan/Documents/GitHub/PrestaEdit/prestaedit.github.io/poc-astro`).
- Le projet n'a pas de framework de test : la vérification se fait sur le HTML généré par `npm run build` (dossier `dist/`), plus un contrôle visuel final dans le navigateur (serveur de dev `prestaedit-blog` de `.claude/launch.json`, port 4321).
- Article riche : `src/content/blog/hooks-prestashop-9-2.mdx`. Article témoin (ne doit pas changer d'aspect) : `src/content/blog/tester-son-module-via-ci-cd.mdx`.
- Commits en local sur `main`, format `type(scope): message` en français, terminés par la ligne `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. **Ne pas pousser** : la publication se fait à la fin, avec l'accord de l'utilisateur.
- Ne jamais inclure dans un commit `.claude/launch.json` ni `public/head/2023-11-30-*` / `public/head/2024-06-14-*` (modifications de l'utilisateur, hors sujet).

## Fichiers

| Fichier | Rôle |
|---|---|
| `src/lib/palette.ts` (modifié) | `accentStyle(tags)` : chaîne `--accent-*` de la famille dominante |
| `src/lib/shiki-title.mjs` (créé) | Transformer Shiki `title="…"` → `data-title` / `data-lang` sur `<pre>` |
| `astro.config.mjs` (modifié) | Branche le transformer |
| `src/styles/global.css` (modifié) | Bandeau des `pre[data-title]`, `.pfx` et titres de hooks |
| `src/content.config.ts` (modifié) | Champ `hero` optionnel |
| `src/components/rich/ArticleHero.astro` (créé) | En-tête sombre |
| `src/components/rich/Journey.astro` (créé) | Parcours en pastilles |
| `src/components/rich/Takeaways.astro` (créé) | Carte « l'essentiel » |
| `src/components/rich/Kicker.astro` (créé) | Surtitre de section |
| `src/components/rich/Spec.astro` (créé) | Fiche libellé/valeur |
| `src/components/rich/Bench.astro` (créé) | Banc d'essai |
| `src/pages/blog/[...slug].astro` (modifié) | Style d'accent, bascule hero, enregistrement des composants |
| `src/content/blog/hooks-prestashop-9-2.mdx` (modifié) | Migration de l'article |

---

### Task 1: Variables d'accent sur les pages article

**Goal:** Chaque `<article>` de page article porte les variables `--accent-50…800` de la famille dominante de ses tags.

**Files:**
- Modify: `src/lib/palette.ts` (ajout en fin de fichier)
- Modify: `src/pages/blog/[...slug].astro:11` (import) et `:59` (balise `<article>`)

**Acceptance Criteria:**
- [ ] L'article hooks 9.2 (tags PrestaShop 9 + Tutoriel) porte `--accent-500: #f97316` (orange, famille plateforme).
- [ ] L'article témoin (tags Tests…) porte `--accent-500: #10b981` (emerald).
- [ ] Aucun autre changement de rendu.

**Verify:** `npm run build >/dev/null 2>&1; grep -o -- '--accent-500: #[0-9a-f]*' dist/blog/hooks-prestashop-9-2/index.html dist/blog/tester-son-module-via-ci-cd/index.html` → `…hooks…: --accent-500: #f97316` et `…tester…: --accent-500: #10b981`

**Steps:**

- [ ] **Step 1: Vérifier l'état de départ**

Run: `npm run build >/dev/null 2>&1; grep -c -- '--accent-500' dist/blog/hooks-prestashop-9-2/index.html`
Expected: `0`

- [ ] **Step 2: Ajouter `accentStyle` à la fin de `src/lib/palette.ts`**

```ts
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
```

- [ ] **Step 3: Poser le style sur `<article>`**

Dans `src/pages/blog/[...slug].astro`, remplacer la ligne 11 :

```astro
import { accentStyle, chipClass, placeholderFor } from '../../lib/palette';
```

et la ligne 59 :

```astro
  <article class="mx-auto max-w-6xl px-4 py-16" style={accentStyle(post.data.tags)}>
```

- [ ] **Step 4: Lancer la vérification**

Run: la commande **Verify** ci-dessus. Expected : les deux lignes indiquées.

- [ ] **Step 5: Commit**

```bash
git add src/lib/palette.ts "src/pages/blog/[...slug].astro"
git commit -m "feat(article): variables d'accent par famille de tags

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Blocs de code avec nom de fichier

**Goal:** ` ```php title="x.php" ` produit un bandeau fichier + langage au-dessus du code ; l'article hooks 9.2 utilise cette syntaxe à la place des légendes en italique.

**Files:**
- Create: `src/lib/shiki-title.mjs`
- Modify: `astro.config.mjs`
- Modify: `src/styles/global.css`
- Modify: `src/content/blog/hooks-prestashop-9-2.mdx` (20 légendes)

**Acceptance Criteria:**
- [ ] 20 `<pre>` de l'article hooks portent `data-title`, dont `data-title="pe_hooks92.php"`.
- [ ] Plus aucune légende `*\`…\`*` dans le `.mdx`.
- [ ] L'article témoin n'a aucun `data-title`.

**Verify:** `npm run build >/dev/null 2>&1; grep -o 'data-title="[^"]*"' dist/blog/hooks-prestashop-9-2/index.html | wc -l; grep -c 'data-title' dist/blog/tester-son-module-via-ci-cd/index.html` → `20` puis `0`

**Steps:**

- [ ] **Step 1: Vérifier l'état de départ**

Run: `grep -c '^\*`' src/content/blog/hooks-prestashop-9-2.mdx`
Expected: `20`

- [ ] **Step 2: Créer `src/lib/shiki-title.mjs`**

```js
/**
 * Shiki transformer: ```php title="file.php" puts the file name and the language
 * on the <pre>, the CSS draws the header bar from these attributes.
 */
export function transformerTitle() {
  return {
    name: 'prestaedit:title',
    pre(node) {
      const title = (this.options.meta?.__raw ?? '').match(/title="([^"]+)"/)?.[1];
      if (!title) return;
      node.properties['data-title'] = title;
      node.properties['data-lang'] = this.options.lang;
    },
  };
}
```

- [ ] **Step 3: Brancher le transformer dans `astro.config.mjs`**

Ajouter l'import après les autres :

```js
import { transformerTitle } from './src/lib/shiki-title.mjs';
```

et remplacer le bloc `markdown` :

```js
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: true, transformers: [transformerTitle()] },
  },
```

- [ ] **Step 4: Ajouter le style dans `src/styles/global.css`** (à la suite des deux lignes existantes)

```css

/* Code blocks with title="…": file name bar, language on the right */
pre[data-title] {
  position: relative;
  padding-top: 3rem !important;
}
pre[data-title]::before,
pre[data-title]::after {
  position: absolute;
  top: 0;
  padding: 0.6rem 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.75rem;
  line-height: 1.25rem;
}
pre[data-title]::before {
  content: attr(data-title);
  left: 0;
  right: 0;
  color: #c9d1d9;
  border-bottom: 1px solid #30363d;
}
pre[data-title]::after {
  content: attr(data-lang);
  right: 0;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 5: Convertir les légendes de l'article**

```bash
perl -0pi -e 's/^\*`([^`\n]+)`\*\n\n```(\w+)\n/```$2 title="$1"\n/mg' src/content/blog/hooks-prestashop-9-2.mdx
grep -c '^\*`' src/content/blog/hooks-prestashop-9-2.mdx
grep -c '^```[a-z]* title=' src/content/blog/hooks-prestashop-9-2.mdx
```

Expected: `0` puis `20`.

- [ ] **Step 6: Lancer la vérification**

Run: la commande **Verify**. Expected : `20` puis `0`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/shiki-title.mjs astro.config.mjs src/styles/global.css src/content/blog/hooks-prestashop-9-2.mdx
git commit -m "feat(code): bandeau nom de fichier via title= sur les blocs de code

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Hero sombre activé par le frontmatter

**Goal:** Un article avec `hero` affiche un en-tête sombre pleine largeur à la place du bloc titre + couverture ; les autres articles ne changent pas.

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/components/rich/ArticleHero.astro`
- Modify: `src/pages/blog/[...slug].astro` (import, bloc titre lignes 65-86)
- Modify: `src/content/blog/hooks-prestashop-9-2.mdx` (frontmatter, intro, encadré « Environnement de test »)

**Acceptance Criteria:**
- [ ] L'article hooks contient `data-article-hero`, un `<h1>` avec `<span style="color: var(--accent-500)">hooks</span>`, les 4 pastilles `meta`, et plus d'`<img>` de couverture dans l'en-tête.
- [ ] Le chapô du hero reprend `hero.lead` ; le paragraphe d'intro et l'encadré « Environnement de test » ne sont plus dans le corps.
- [ ] L'article témoin n'a pas `data-article-hero` et garde son image de couverture.
- [ ] `transition:name` du titre conservé (morph depuis les cartes).

**Verify:** `npm run build 2>&1 | grep -ci error; grep -c 'data-article-hero' dist/blog/hooks-prestashop-9-2/index.html dist/blog/tester-son-module-via-ci-cd/index.html; grep -c 'Environnement de test' dist/blog/hooks-prestashop-9-2/index.html` → `0`, puis `…hooks…:1` / `…tester…:0`, puis `0`

**Steps:**

- [ ] **Step 1: Ajouter `hero` au schéma** — dans `src/content.config.ts`, après la ligne `draft: z.boolean().default(false),` :

```ts
    hero: z
      .object({
        eyebrow: z.string(),
        highlight: z.string().optional(),
        lead: z.string().optional(),
        meta: z.array(z.string()).default([]),
      })
      .optional(),
```

- [ ] **Step 2: Créer `src/components/rich/ArticleHero.astro`**

```astro
---
interface Props {
  id: string;
  title: string;
  summary?: string;
  author: string;
  date: Date;
  tags: string[];
  hero: { eyebrow: string; highlight?: string; lead?: string; meta: string[] };
}
const { id, title, summary, author, date, tags, hero } = Astro.props;

const formatted = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const at = hero.highlight ? title.indexOf(hero.highlight) : -1;
const [before, word, after] = at >= 0
  ? [title.slice(0, at), hero.highlight!, title.slice(at + hero.highlight!.length)]
  : [title, '', ''];
const lead = hero.lead ?? summary;
---
<header data-article-hero class="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-slate-50 md:px-12 md:py-16">
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0"
    style="background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 40px 40px;"
  ></div>
  <div class="relative max-w-3xl">
    <p class="font-mono text-xs font-semibold uppercase tracking-wider" style="color: var(--accent-500)">{hero.eyebrow}</p>
    <h1 transition:name={`title-${id}`} class="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
      {before}{word && <span style="color: var(--accent-500)">{word}</span>}{after}
    </h1>
    {lead && <p class="mt-6 text-lg leading-relaxed text-slate-300">{lead}</p>}
    {hero.meta.length > 0 && (
      <ul class="mt-8 flex flex-wrap gap-2">
        {hero.meta.map((m) => (
          <li class="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-1 text-sm text-slate-300">{m}</li>
        ))}
      </ul>
    )}
    <div transition:name={`meta-${id}`} class="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
      <span class="font-medium text-slate-200">{author}</span>
      <span>•</span>
      <time datetime={date.toISOString()}>{formatted}</time>
      {tags.map((t) => (
        <span class="rounded-full border border-slate-700 px-2.5 py-0.5 text-xs text-slate-300">{t}</span>
      ))}
    </div>
  </div>
</header>
```

- [ ] **Step 3: Brancher le hero dans `src/pages/blog/[...slug].astro`**

Ajouter l'import après celui de `TableOfContents` :

```astro
import ArticleHero from '../../components/rich/ArticleHero.astro';
```

Remplacer le bloc des lignes 65 à 86 (de `<div class="grid gap-12 lg:grid-cols-[1fr_280px]">` jusqu'à l'ouverture de la div `prose` incluse) par :

```astro
    {post.data.hero && (
      <div class="mb-12">
        <ArticleHero
          id={post.id}
          title={post.data.title}
          summary={post.data.summary}
          author={post.data.author}
          date={post.data.date}
          tags={post.data.tags}
          hero={post.data.hero}
        />
      </div>
    )}

    <div class="grid gap-12 lg:grid-cols-[1fr_280px]">
      <div class="min-w-0">
        {!post.data.hero && (
          <Fragment>
            <div class="mb-4 flex flex-wrap gap-2">
              {post.data.tags.map((t) => (
                <span class:list={['rounded-full px-2.5 py-0.5 text-xs font-medium', chipClass(t)]}>{t}</span>
              ))}
            </div>
            <h1 transition:name={`title-${post.id}`} class="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">{post.data.title}</h1>
            <div transition:name={`meta-${post.id}`} class="mt-4 flex items-center gap-3 text-sm text-gray-500">
              <span class="font-medium text-gray-700">{post.data.author}</span>
              <span>•</span>
              <time datetime={post.data.date.toISOString()}>{formatted}</time>
            </div>
            <img
              src={post.data.featuredimg ?? placeholderFor(post.data.tags)}
              alt={post.data.title}
              transition:name={`hero-${post.id}`}
              class="mt-8 aspect-[1200/630] w-full rounded-2xl object-cover"
              onerror={`this.onerror=null;this.src='${placeholderFor(post.data.tags)}';`}
            />
          </Fragment>
        )}

        <div class:list={['prose prose-lg prose-blue max-w-none prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-200 prose-code:before:content-none prose-code:after:content-none', !post.data.hero && 'mt-10']}>
```

- [ ] **Step 4: Migrer l'en-tête de l'article hooks**

Dans `src/content/blog/hooks-prestashop-9-2.mdx`, ajouter au frontmatter, juste avant la ligne `---` de fermeture :

```yaml
hero:
  eyebrow: "PrestaShop 9.2 · Développement de modules"
  highlight: "hooks"
  lead: "La 9.2 ajoute 47 hooks. Quarante-deux sont générés automatiquement par les pages du back office migrées vers Symfony. Les cinq autres touchent le front office et changent vraiment ce qu'un module peut faire, à commencer par le tunnel de commande. Pour chacun : où il est appelé, un cas d'usage concret, le code complet et ce que les tests ont révélé."
  meta:
    - "Testé sur PrestaShop 9.2.0-rc.1"
    - "Thème Hummingbird 2.1"
    - "PHP 8.5"
    - "Module de démo pe_hooks92"
```

Puis supprimer du corps le paragraphe d'intro (« La 9.2 ajoute 47 hooks. Quarante-deux… ce que les tests ont révélé. ») et tout le bloc :

```mdx
<Info title="Environnement de test">
**PrestaShop 9.2.0-rc.1**, thème **Hummingbird 2.1**, **PHP 8.5**. Tout le code vient du module de démonstration [`pe_hooks92`](#le-module-de-démonstration), téléchargeable en fin d'article.
</Info>
```

Le corps commence alors par `## Le parcours client, hook par hook`.

- [ ] **Step 5: Lancer la vérification**

Run: la commande **Verify**. Expected : `0`, `…hooks…:1`, `…tester…:0`, `0`.
Contrôle complémentaire : `grep -o '<span style="color: var(--accent-500)">hooks</span>' dist/blog/hooks-prestashop-9-2/index.html` → une ligne.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/components/rich/ArticleHero.astro "src/pages/blog/[...slug].astro" src/content/blog/hooks-prestashop-9-2.mdx
git commit -m "feat(article): hero sombre activé par le frontmatter

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Composants MDX Journey, Takeaways, Kicker, Spec, Bench

**Goal:** Les cinq composants existent, sont disponibles dans tous les articles et ont leurs styles ; les titres de hooks avec `.pfx` sont en mono avec préfixe coloré.

**Files:**
- Create: `src/components/rich/Journey.astro`, `Takeaways.astro`, `Kicker.astro`, `Spec.astro`, `Bench.astro`
- Modify: `src/pages/blog/[...slug].astro:14` (`mdxComponents`) et imports
- Modify: `src/styles/global.css`

**Acceptance Criteria:**
- [ ] Les 5 composants sont importés et présents dans `mdxComponents`.
- [ ] Le build passe (aucun article ne les utilise encore : rendu inchangé partout).

**Verify:** `npm run build 2>&1 | grep -ci error; grep -c 'Journey, Takeaways, Kicker, Spec, Bench' "src/pages/blog/[...slug].astro"` → `0` puis `1`

**Steps:**

- [ ] **Step 1: Créer `src/components/rich/Journey.astro`**

```astro
---
interface Item { place: string; hook: string; href: string; muted?: boolean }
interface Props { items: Item[] }
const { items } = Astro.props;
---
<nav class="not-prose my-10 rounded-2xl border border-gray-200 bg-gray-50 p-6" aria-label="Parcours">
  <ol class="flex flex-wrap gap-x-6 gap-y-5">
    {items.map((it, i) => (
      <li class="flex flex-col gap-1.5">
        <span class="text-xs font-medium uppercase tracking-wider text-gray-500">
          {String(i + 1).padStart(2, '0')} · {it.place}
        </span>
        <a
          href={it.href}
          class:list={[
            'rounded-lg border px-3 py-1.5 font-mono text-sm transition',
            it.muted ? 'border-gray-300 bg-white text-gray-600 hover:border-gray-400' : 'journey-chip',
          ]}
        >{it.hook}</a>
      </li>
    ))}
  </ol>
</nav>

<style>
  .journey-chip {
    border-color: var(--accent-200);
    background: var(--accent-50);
    color: var(--accent-800);
  }
  .journey-chip:hover {
    border-color: var(--accent-500);
  }
</style>
```

- [ ] **Step 2: Créer `src/components/rich/Takeaways.astro`**

```astro
---
/** Wraps a markdown list whose items start with **Label**: the label becomes a pill. */
---
<div class="takeaways my-10 rounded-2xl bg-gray-50 px-6 py-2" style="border-left: 4px solid var(--accent-500); border-radius: 0 1rem 1rem 0;">
  <slot />
</div>

<style>
  .takeaways :global(ul) {
    list-style: none;
    padding-left: 0;
  }
  .takeaways :global(li) {
    padding-left: 0;
  }
  .takeaways :global(li > strong:first-child),
  .takeaways :global(li > p:first-child > strong:first-child) {
    display: inline-block;
    margin-right: 0.5rem;
    border-radius: 0.375rem;
    padding: 0 0.5rem;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: var(--accent-100);
    color: var(--accent-800);
  }
</style>
```

- [ ] **Step 3: Créer `src/components/rich/Kicker.astro`**

```astro
---
/** Small mono overline, placed right before a ## heading. */
---
<p class="kicker not-prose mb-0 mt-16 font-mono text-xs font-semibold uppercase tracking-wider" style="color: var(--accent-700)">
  <slot />
</p>

<style>
  .kicker + :global(h2) {
    margin-top: 0.25rem;
  }
</style>
```

- [ ] **Step 4: Créer `src/components/rich/Spec.astro`**

```astro
---
/** Wraps a 2-column markdown table with an empty header: label / value grid. */
---
<div class="spec"><slot /></div>

<style>
  .spec :global(table) {
    margin: 1.5rem 0;
    font-size: 0.95rem;
  }
  .spec :global(thead) {
    display: none;
  }
  .spec :global(td) {
    padding: 0.6rem 0;
    vertical-align: top;
  }
  .spec :global(td:first-child) {
    width: 9rem;
    padding-right: 1rem;
    color: #6b7280;
    white-space: nowrap;
  }
  .spec :global(td:first-child strong) {
    font-weight: 500;
    color: inherit;
  }
</style>
```

- [ ] **Step 5: Créer `src/components/rich/Bench.astro`**

```astro
---
/** Test bench card around a markdown table: | | Test | Résultat |, first cell ✅ or ❌. */
interface Props { title?: string }
const { title = "Banc d'essai" } = Astro.props;
---
<div class="bench my-8 rounded-2xl border p-5" style="border-color: var(--accent-200); background: var(--accent-50);">
  <p class="bench-title">{title}</p>
  <slot />
</div>

<style>
  .bench-title {
    margin: 0 0 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--accent-800);
  }
  .bench :global(table) {
    margin: 0;
    font-size: 0.9rem;
  }
  .bench :global(thead) {
    display: none;
  }
  .bench :global(td) {
    padding: 0.5rem;
    vertical-align: top;
  }
  .bench :global(td:first-child) {
    width: 2rem;
    text-align: center;
  }
  .bench :global(td:last-child) {
    text-align: right;
    color: var(--accent-800);
  }
  .bench :global(tbody tr) {
    border-color: var(--accent-200);
  }
</style>
```

- [ ] **Step 6: Enregistrer les composants** — dans `src/pages/blog/[...slug].astro`, ajouter après l'import d'`ArticleHero` :

```astro
import Journey from '../../components/rich/Journey.astro';
import Takeaways from '../../components/rich/Takeaways.astro';
import Kicker from '../../components/rich/Kicker.astro';
import Spec from '../../components/rich/Spec.astro';
import Bench from '../../components/rich/Bench.astro';
```

et remplacer la ligne `const mdxComponents = …` par :

```astro
const mdxComponents = { Info, Warning, Note, Tip, Danger, Journey, Takeaways, Kicker, Spec, Bench };
```

- [ ] **Step 7: Styles des titres de hooks** — ajouter à la fin de `src/styles/global.css` :

```css

/* Hook headings: ## <span class="pfx">action</span>Name */
.prose h2:has(.pfx) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: -0.02em;
}
.prose .pfx {
  color: var(--accent-600);
}
```

- [ ] **Step 8: Lancer la vérification**

Run: la commande **Verify**. Expected : `0` puis `1`.

- [ ] **Step 9: Commit**

```bash
git add src/components/rich "src/pages/blog/[...slug].astro" src/styles/global.css
git commit -m "feat(article): composants MDX Journey, Takeaways, Kicker, Spec, Bench

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Migrer le corps de l'article hooks 9.2

**Goal:** L'article utilise les composants ; texte et code inchangés, ancres et sommaire intacts.

**Files:**
- Modify: `src/content/blog/hooks-prestashop-9-2.mdx`

**Acceptance Criteria:**
- [ ] 1 `Journey`, 1 `Takeaways`, 6 `Kicker`, 5 `Spec`, 6 `Bench` dans le `.mdx`.
- [ ] Plus de ligne `**Banc d'essai…**` ni de ligne `*Action · …*` / `*Display · …*` / `*+42 · …*`.
- [ ] Dans le HTML, les ids `actioncheckoutbuildprocess`, `displaycartbelowsummary`, `displayorderdetailproductline`, `displaysubcategories`, `actionnotfound`, `les-hooks-du-back-office` existent toujours.

**Verify:**
```bash
npm run build 2>&1 | grep -ci error
for c in '<Journey' '<Takeaways>' '<Kicker>' '<Spec>' '<Bench'; do printf '%s ' "$c"; grep -c "$c" src/content/blog/hooks-prestashop-9-2.mdx; done
for id in actioncheckoutbuildprocess displaycartbelowsummary displayorderdetailproductline displaysubcategories actionnotfound les-hooks-du-back-office; do grep -c "id=\"$id\"" dist/blog/hooks-prestashop-9-2/index.html; done
```
→ `0` ; `<Journey 1`, `<Takeaways> 1`, `<Kicker> 6`, `<Spec> 5`, `<Bench 6` ; six fois `1`.

**Steps:**

- [ ] **Step 1: Parcours** — remplacer le tableau `| Où | Hook |` (7 lignes, sous `## Le parcours client, hook par hook`) par :

```mdx
<Journey items={[
  { place: 'Catégorie', hook: 'displaySubcategories', href: '#displaysubcategories' },
  { place: 'Panier', hook: 'displayCartBelowSummary', href: '#displaycartbelowsummary' },
  { place: 'Commande', hook: 'actionCheckoutBuildProcess', href: '#actioncheckoutbuildprocess' },
  { place: 'Compte client', hook: 'displayOrderDetailProductLine', href: '#displayorderdetailproductline' },
  { place: 'Page introuvable', hook: 'actionNotFound', href: '#actionnotfound' },
  { place: 'Back office', hook: 'actionOrderReturnForm & co', href: '#les-hooks-du-back-office', muted: true },
]} />
```

- [ ] **Step 2: L'essentiel** — entourer la liste sous `## L'essentiel en 30 secondes` et retirer le ` :` après chaque étiquette :

```mdx
<Takeaways>

- **Checkout** Un module peut enfin fournir son propre tunnel de commande. Mais s'il y a deux providers actifs, PrestaShop n'en garde aucun et affiche le tunnel natif, sans prévenir. Or la 9.2 livre justement un one-page checkout officiel qui utilise ce hook.
- **Panier** Le bloc sous les totaux n'est pas rafraîchi quand le client change une quantité. Il faut le recharger soi-même.
- **Thème** Les trois hooks `display*` n'existent que dans Hummingbird. Classic ne les appelle pas, et `displayOrderDetailProductLine` demande Hummingbird 2.1.1 ou plus.
- **404** `Tools::redirect()` interprète un chemin relatif comme un nom de page. Passez-lui toujours une URL absolue.
- **Back office** Ajouter un champ à un formulaire d'options avec `action…Form` provoque une erreur 500 à l'enregistrement. La solution est un champ non mappé.

</Takeaways>
```

- [ ] **Step 3: En-têtes des sections de hooks** — six remplacements (avant → après) :

Avant :
```mdx
## actionCheckoutBuildProcess

*Action · Tunnel de commande.* Le hook le plus attendu
```
Après :
```mdx
<Kicker>01 · Action · Tunnel de commande</Kicker>

## <span class="pfx">action</span>CheckoutBuildProcess

Le hook le plus attendu
```

Même transformation pour :

| Titre actuel | Ligne en italique à retirer | Kicker | Nouveau titre |
|---|---|---|---|
| `## displayCartBelowSummary` | `*Display · Page panier.* ` | `02 · Display · Page panier` | `## <span class="pfx">display</span>CartBelowSummary` |
| `## displayOrderDetailProductLine` | `*Display · Compte client.* ` | `03 · Display · Compte client` | `## <span class="pfx">display</span>OrderDetailProductLine` |
| `## displaySubcategories` | `*Display · Page catégorie.* ` | `04 · Display · Page catégorie` | `## <span class="pfx">display</span>Subcategories` |
| `## actionNotFound` | `*Action · Erreur 404.* ` | `05 · Action · Erreur 404` | `## <span class="pfx">action</span>NotFound` |
| `## Les hooks du back office` | `*+42 · Action · Back office.* ` | `+42 · Action · Back office` | `## Les hooks du back office` (inchangé) |

Seul le préfixe en italique est retiré ; le reste de la phrase (le pitch) reste en paragraphe.

- [ ] **Step 4: Fiches techniques** — entourer chacun des 5 tableaux `| | |` (ceux dont les lignes commencent par `| **Appelé par**` ou `| **Appelé dans**`) avec une ligne vide avant/après :

```mdx
<Spec>

| | |
|---|---|
| **Appelé par** | … |

</Spec>
```

- [ ] **Step 5: Bancs d'essai** — pour chacune des 6 lignes en gras, remplacer la ligne par l'ouverture du composant et fermer après le tableau qui suit :

| Ligne actuelle | Ouverture |
|---|---|
| `**Banc d'essai**` (3 occurrences : checkout, subcategories, 404) | `<Bench>` |
| `**Banc d'essai (seuil à 100 €)**` | `<Bench title="Banc d'essai · seuil à 100 €">` |
| `**Banc d'essai (garantie de 24 mois)**` | `<Bench title="Banc d'essai · garantie de 24 mois">` |
| `**Banc d'essai (Retours produits)**` | `<Bench title="Banc d'essai · Retours produits">` |

Forme attendue :

```mdx
<Bench title="Banc d'essai · seuil à 100 €">

| | Test | Résultat |
|---|---|---|
| ✅ | 1 t-shirt à 19,12 € | « Plus que 80,88 € » |

</Bench>
```

- [ ] **Step 6: Lancer la vérification**

Run: la commande **Verify**. Expected : voir ci-dessus.

- [ ] **Step 7: Commit**

```bash
git add src/content/blog/hooks-prestashop-9-2.mdx
git commit -m "content(prestashop-9): passer l'article hooks 9.2 sur le layout riche

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Contrôle visuel bureau et mobile

**Goal:** Confirmer dans le navigateur que l'article riche rend comme prévu et que l'article témoin est inchangé.

**Files:** aucun (corrections éventuelles dans les fichiers des tâches 1 à 5, commit `fix(article): …`).

**Acceptance Criteria:**
- [ ] Hooks 9.2, bureau : hero sombre pleine largeur, mot « hooks » orange, parcours en pastilles orange, fiches en grille, bancs d'essai en cartes orange pâle, bandeaux de fichier sur les blocs de code, titres de hooks en mono avec préfixe orange.
- [ ] Hooks 9.2, 375 px : pas de défilement horizontal de la page (`document.documentElement.scrollWidth <= 375`).
- [ ] Sommaire : chaque lien pointe vers un id existant.
- [ ] Article témoin : bloc titre + image de couverture comme avant, aucun bandeau de fichier.
- [ ] Console du navigateur sans erreur.

**Verify:** captures d'écran + résultat JS ci-dessous.

**Steps:**

- [ ] **Step 1:** `preview_start` avec `name: "prestaedit-blog"`, puis ouvrir `http://localhost:4321/blog/hooks-prestashop-9-2/`.
- [ ] **Step 2:** Exécuter dans la page :

```js
({
  hero: !!document.querySelector('[data-article-hero]'),
  titles: document.querySelectorAll('pre[data-title]').length,
  brokenToc: [...document.querySelectorAll('[data-toc-link]')]
    .map((a) => a.dataset.tocLink)
    .filter((id) => !document.getElementById(id)),
  overflow: document.documentElement.scrollWidth > window.innerWidth,
})
```

Expected : `{ hero: true, titles: 20, brokenToc: [], overflow: false }`.
- [ ] **Step 3:** Captures en largeur bureau : hero, parcours, une section de hook (kicker + titre + fiche + code), un banc d'essai.
- [ ] **Step 4:** `resize_window` preset `mobile`, recharger, relancer le JS du Step 2 (overflow doit rester `false`), capture du hero et du parcours. Revenir au preset `desktop`.
- [ ] **Step 5:** Ouvrir `http://localhost:4321/blog/tester-son-module-via-ci-cd/`, capture : titre, méta et image de couverture comme avant.
- [ ] **Step 6:** `read_console_messages` avec `onlyErrors: true` → aucune erreur.
- [ ] **Step 7:** Si une correction a été nécessaire : `npm run build`, puis commit `fix(article): …` avec la ligne Co-Authored-By.

---

## Publication (hors tâches)

Une fois les tâches validées, demander à l'utilisateur l'autorisation de pousser `main` (`git push origin main`), ce qui déclenche le déploiement Cloudflare Pages.
