import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('PrestaEdit'),
    series: z.string().optional(),
    featuredimg: z
      .string()
      .optional()
      .transform((v) => v?.replace(/^https:\/\/prestaedit\.github\.io/, '')),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
    hero: z
      .object({
        eyebrow: z.string(),
        highlight: z.string().optional(),
        lead: z.string().optional(),
        meta: z.array(z.string()).default([]),
      })
      .optional(),
  }),
});

export const collections = { blog };
