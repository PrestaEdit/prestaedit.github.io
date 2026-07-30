import { getCollection, type CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'blog'>;

/**
 * Returns published posts:
 * - dev: everything
 * - prod: excludes `draft: true` and posts dated after today
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const all = await getCollection('blog');
  if (import.meta.env.DEV) return all;

  const now = Date.now();
  return all.filter((p) => !p.data.draft && p.data.date.valueOf() <= now);
}
