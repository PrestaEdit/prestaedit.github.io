import { config, collection, fields } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

const calloutSchema = { title: fields.text({ label: 'Titre' }) };

export default config({
  storage: {
    kind: 'github',
    repo: { owner: 'PrestaEdit', name: 'prestaedit.github.io' },
    pathPrefix: 'poc-astro',
  },
  ui: {
    brand: { name: 'PrestaEdit' },
    navigation: { articles: ['blog'] },
  },
  collections: {
    blog: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'date', 'draft'],
      schema: {
        title: fields.slug({
          name: { label: 'Titre', validation: { length: { min: 3 } } },
          slug: {
            label: 'Slug (URL)',
            description: 'Prefixe la date : 2027-03-15-mon-slug',
          },
        }),
        date: fields.date({
          label: 'Date de publication',
          description: 'Une date future = article publié à cette date automatiquement.',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        author: fields.text({ label: 'Auteur', defaultValue: 'PrestaEdit' }),
        series: fields.text({
          label: 'Série',
          description: 'Slug court (ex: prestaflow). Vide si standalone.',
        }),
        featuredimg: fields.url({
          label: 'Image mise en avant',
          description: 'Chemin absolu (/head/mon-slug.png) ou URL externe.',
        }),
        summary: fields.text({
          label: 'Résumé',
          multiline: true,
          description: 'Affiché sur les cards et dans le flux RSS.',
        }),
        draft: fields.checkbox({
          label: 'Brouillon',
          description: 'Coché = invisible en production.',
        }),
        content: fields.mdx({
          label: 'Contenu',
          options: {
            image: { directory: 'public/posts', publicPath: '/posts/' },
          },
          components: {
            Info: block({ label: 'Info (bleu)', schema: calloutSchema }),
            Warning: block({ label: 'Warning (ambre)', schema: calloutSchema }),
            Note: block({ label: 'Note (gris)', schema: calloutSchema }),
            Tip: block({ label: 'Tip (vert)', schema: calloutSchema }),
            Danger: block({ label: 'Danger (rouge)', schema: calloutSchema }),
          },
        }),
      },
    }),
  },
});
