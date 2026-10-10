import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Creator's Journal. Add a Markdown file to src/content/journal/ to publish an article.
 * Files whose names start with "_" are ignored (see _template.md).
 */
const journal = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    published: z.boolean().default(false),
  }),
});

export const collections = { journal };
