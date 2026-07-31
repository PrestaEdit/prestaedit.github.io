import { writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '..', 'src', 'content', 'blog');

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('usage: npm run new -- "Titre de l\'article"');
  process.exit(1);
}

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const slug = slugify(title);
const path = join(BLOG_DIR, `${slug}.mdx`);

try {
  await access(path);
  console.error(`Already exists: ${path}`);
  process.exit(1);
} catch {}

const template = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${today}
tags:
  - Outils
author: PrestaEdit
series:
featuredimg: '/head/${slug}.svg'
summary: ""
draft: true
---

Introduction courte de l'article.

## Section 1

Contenu.

<Info title="Un point à retenir">
Le texte de la note.
</Info>

## Section 2

Suite.
`;

await writeFile(path, template);
console.log(`✔ Créé : src/content/blog/${slug}.mdx`);
console.log('');
console.log('Prochaines étapes :');
console.log(`  1. Éditer l'article dans Keystatic ou le fichier .mdx`);
console.log(`  2. npm run og -- ${slug}   # générer la cover`);
console.log(`  3. npm run publish -- ${slug}   # quand prêt à sortir`);
