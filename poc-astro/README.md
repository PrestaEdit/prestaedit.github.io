# PrestaEdit blog — POC Astro

Nouveau blog en **Astro 5 + Tailwind v4 + Preline** (blocs gratuits), remplacement
progressif du VuePress historique. Déployé sur **Cloudflare Pages**.

## Structure

```
poc-astro/
├── src/
│   ├── content/blog/       # articles .mdx (frontmatter YAML + composants)
│   ├── content.config.ts   # schéma Zod des articles
│   ├── layouts/            # BaseLayout (ClientRouter, transitions)
│   ├── components/         # Header, Footer, ArticleCard, Callouts, TOC…
│   ├── pages/              # routes
│   │   ├── [...page].astro     # home paginée (12/page)
│   │   ├── about.astro
│   │   ├── rss.xml.ts          # flux RSS
│   │   ├── blog/[...slug].astro
│   │   ├── series/index.astro + [slug].astro
│   │   └── tags/index.astro + [tag].astro
│   └── lib/slug.ts         # slugify NFD
├── public/                 # assets statiques (head/, posts/, _headers, _redirects)
├── scripts/migrate.pl      # convertit .md VuePress → .mdx Astro
├── astro.config.mjs
├── wrangler.toml           # config Cloudflare Pages
└── package.json
```

## Développement

```bash
cd poc-astro
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/
```

## Déploiement Cloudflare Pages

Le workflow GitHub Actions `.github/workflows/deploy-poc.yml` déploie
automatiquement sur push `main` et crée des previews par PR.

### Setup one-shot

1. **Dashboard Cloudflare** → Workers & Pages → Create → Pages → Direct upload
   Nom du projet : `prestaedit-poc`. Skip la config CI (on utilise notre workflow).

2. **API token** : My Profile → API Tokens → Create Token → template
   "Edit Cloudflare Workers" (restreint au compte concerné).

3. **Account ID** : sidebar droite du dashboard Workers & Pages.

4. **Secrets GitHub** (Settings → Secrets and variables → Actions) :
   - `CLOUDFLARE_API_TOKEN` = le token
   - `CLOUDFLARE_ACCOUNT_ID` = l'account ID

5. Push sur `main` → le workflow build + deploy.
   - Production : `https://prestaedit-poc.pages.dev`
   - Preview par PR : `https://<commit>.prestaedit-poc.pages.dev` (commentaire auto sur la PR)

## Écrire un article

Un `.mdx` dans `src/content/blog/` avec frontmatter :

```yaml
---
title: "Titre de l'article"
date: 2026-11-04
tags:
  - Tests
  - PrestaFlow
author: PrestaEdit
series: prestaflow           # optionnel
featuredimg: '/head/2026-11-04-mon-slug.png'   # optionnel
summary: "Description courte affichée sur les cards et flux RSS."
---

Contenu markdown normal + composants :

<Info title="Titre du bloc">Contenu de la note.</Info>
<Warning title="…">…</Warning>
<Note title="…">…</Note>
<Tip title="…">…</Tip>
<Danger title="…">…</Danger>
```

**Contraintes MDX** (vs Markdown VuePress) :

- `<img>` doit être self-closing : `<img src="…" alt="…" />`
- Pas de directives Vue (`:src`, `:href`, `$withBase`) — utiliser des chemins absolus depuis `/`
- Les `<50`, `<200` etc. dans du texte inline doivent être écrits `moins de 50` ou `&lt;50` (MDX parse `<5` comme début de balise JSX)

## Composants MDX disponibles

- `<Info />`, `<Warning />`, `<Note />`, `<Tip />`, `<Danger />` — callouts stylés
- Les code blocks sont coloriés par **Shiki** (thème `github-dark`)
- Tableaux, listes, images, blockquotes : Markdown standard

## Migrer depuis VuePress

```bash
# 1. Copier un post depuis docs/_posts en .mdx
cp docs/_posts/YYYY-MM-DD-slug.md poc-astro/src/content/blog/YYYY-MM-DD-slug.mdx

# 2. Appliquer les transformations (self-close, retrait withBase)
perl poc-astro/scripts/migrate.pl poc-astro/src/content/blog/YYYY-MM-DD-slug.mdx
```

## Features

- **Home paginée** (12/page) avec article vedette
- **Article page** : hero image, sidebar auteur, TOC avec scroll-spy, related posts par série, ligne série inline, prev/next chrono
- **Séries** (`/series` + `/series/[slug]`) — parcours numéroté
- **Tags** (`/tags` + `/tags/[tag]`) — slug normalisé
- **RSS** : `/rss.xml` (40 items), auto-discovery `<link rel="alternate">`
- **View Transitions** : morph des cards vers l'article (image, titre, meta), header/footer persistants
- **Placeholder SVG** pour les articles sans `featuredimg` ou avec URL cassée
- **Cloudflare Pages** : cache immutable sur `/assets/*`, redirects `_posts/*` → `blog/*`, headers de sécurité
