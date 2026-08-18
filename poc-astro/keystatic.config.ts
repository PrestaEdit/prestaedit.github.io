import { config, collection, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';

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
            description: 'Segment d\'URL. Ne pas préfixer par la date, elle vient du champ Date.',
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
            Info: wrapper({ label: 'Info (bleu)', schema: calloutSchema }),
            Warning: wrapper({ label: 'Warning (ambre)', schema: calloutSchema }),
            Note: wrapper({ label: 'Note (gris)', schema: calloutSchema }),
            Tip: wrapper({ label: 'Tip (vert)', schema: calloutSchema }),
            Danger: wrapper({ label: 'Danger (rouge)', schema: calloutSchema }),
            img: block({
              label: 'Image (URL)',
              schema: {
                src: fields.text({ label: 'URL', validation: { length: { min: 1 } } }),
                alt: fields.text({ label: 'Texte alternatif' }),
              },
            }),
          },
        }),
      },
    }),
  },
});
