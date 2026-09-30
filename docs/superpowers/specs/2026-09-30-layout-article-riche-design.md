# Layout d'article riche — design

Date : 2026-09-30
Périmètre : `poc-astro/` (blog Astro)
Premier article concerné : `src/content/blog/hooks-prestashop-9-2.mdx`

## Objectif

Retrouver sur le blog le style de la page source de l'article « hooks PrestaShop 9.2 »
(hero sombre, parcours en pastilles, fiches techniques, bancs d'essai, code avec nom
de fichier), aux couleurs du blog, sous forme de briques réutilisables par d'autres
articles.

## Activation

- Le layout riche s'active quand le frontmatter contient un bloc `hero`.
  Sans `hero`, la page article est strictement inchangée.
- Schéma (dans `content.config.ts`) :

  ```yaml
  hero:
    eyebrow: "PrestaShop 9.2 · Développement de modules"   # requis
    highlight: "hooks"                                     # optionnel, 1re occurrence dans le titre
    lead: "La 9.2 ajoute 47 hooks…"                        # optionnel, chapô du hero (défaut : summary)
    meta: ["Testé sur PrestaShop 9.2.0-rc.1", "PHP 8.5"]   # optionnel, défaut []
  ```

- Avec `hero`, la page article affiche un bandeau sombre (titre, surtitre, résumé,
  pastilles `meta`, date, tags) à la place du bloc titre + image de couverture.
  La couverture reste utilisée par les cartes (`ArticleCard`) et `og:image`.
  La sidebar (auteur, sommaire) est conservée.

## Couleurs

- Accent = famille dominante des tags, via `primaryFamily()` de `src/lib/palette.ts`
  (même règle que les placeholders et les couvertures : outillage > plateforme >
  format > meta). Nouvelle fonction exportée qui renvoie un jeu de
  variables CSS : `--accent-50`, `--accent-100`, `--accent-200`, `--accent-500`,
  `--accent-600`, `--accent-700`, `--accent-800` (valeurs Tailwind de la couleur
  de la famille : emerald, orange, slate, violet, blue par défaut).
- Ces variables sont posées sur l'élément `<article>` pour toutes les pages
  article (riches ou non), afin que les composants fonctionnent partout.
- Hero : fond `slate-900`, texte `slate-50`/`slate-400`, accent `--accent-500`
  (mot `highlight`, surtitre).
- Pas de mode sombre (le blog n'en a pas).

## Composants MDX

Tous dans `src/components/rich/`, enregistrés dans `mdxComponents` de
`src/pages/blog/[...slug].astro`. Ils reposent uniquement sur les variables
`--accent-*` et les classes Tailwind existantes.

| Composant | Usage MDX | Rendu |
|---|---|---|
| `Journey` | `<Journey items={[{ place: 'Panier', hook: 'displayCartBelowSummary', href: '#displaycartbelowsummary' }, …]} />` | Liste ordonnée horizontale (retour à la ligne sur mobile) : libellé du lieu au-dessus, pastille mono cliquable. Un item peut avoir `muted: true` (style gris, pour « Back office »). |
| `Takeaways` | `<Takeaways>` + liste markdown dont chaque item commence par `**Étiquette** :` | Carte à bord d'accent ; le `strong` initial de chaque `li` devient une étiquette (petite pastille accent) via CSS. |
| `Kicker` | `<Kicker>01 · Action · Tunnel de commande</Kicker>` | Surtitre mono, petit, couleur `--accent-700`, placé juste avant un `##`. |
| `Spec` | `<Spec>` + tableau markdown à 2 colonnes, en-tête vide | Grille libellé/valeur : pas d'en-tête visible, libellés gris, séparateurs fins. |
| `Bench` | `<Bench title="Banc d'essai · seuil à 100 €">` + tableau markdown `| | Test | Résultat |` | Carte à fond `--accent-50` ; en-tête de tableau masqué ; cellule ✅ en vert, ❌ en rouge. |

Les `##` des sections de hooks restent des titres markdown (sommaire et ancres
inchangés). Le préfixe coloré s'écrit `## <span class="pfx">action</span>CheckoutBuildProcess` ;
la classe `.pfx` est stylée en `--accent-600` dans la prose. Le slug reste
`actioncheckoutbuildprocess`.

## Code avec nom de fichier

- Syntaxe : ` ```php title="pe_hooks92.php" `.
- Un transformer Shiki (dans `astro.config.mjs`, fichier `src/lib/shiki-title.mjs`)
  lit `title="…"` dans la meta et ajoute `data-title` et `data-lang` sur le `<pre>`.
- CSS globale : un `pre[data-title]` affiche un bandeau (nom de fichier à gauche,
  langage à droite) au-dessus du code. Sans `title`, aucun changement.
- S'applique à tout le blog.

## Migration de l'article hooks 9.2

- Ajouter `hero` au frontmatter.
- Remplacer : tableau « parcours » → `Journey` ; liste « essentiel » → `Takeaways` ;
  lignes `*Action · …*` → `Kicker` + pitch en paragraphe ; tableaux fiche →
  `Spec` ; bancs d'essai → `Bench` ; lignes `*\`fichier\`*` → `title="…"` sur le bloc.
- Supprimer l'encadré « Environnement de test » (repris par `hero.meta`).
- Le texte et le code ne changent pas.

## Hors périmètre

Mode sombre, polices spécifiques de la page source, refonte des callouts existants,
prise en charge de `hero` et des nouveaux composants dans Keystatic (un article
riche s'édite dans le fichier `.mdx`).

## Vérification

- `npm run build` sans erreur.
- Contrôle visuel dans le navigateur (bureau et 375 px) de l'article hooks 9.2
  et d'un article sans `hero` (`tester-son-module-via-ci-cd`) : ce dernier ne doit
  pas changer, hormis les blocs de code sans `title` qui restent identiques.
- Sommaire et ancres de l'article hooks 9.2 fonctionnels.
