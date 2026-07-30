import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: 'PrestaEdit — PrestaShop, sous le capot.',
    description: 'Notes techniques autour de PrestaShop par Jonathan Danse.',
    site: context.site ?? 'https://prestaedit.github.io',
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary ?? '',
      link: `/blog/${p.id}/`,
      author: p.data.author,
      categories: p.data.tags,
    })),
    customData: `<language>fr-fr</language>`,
  });
}
