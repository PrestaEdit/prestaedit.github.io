import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '..', 'src', 'content', 'blog');

// usage: node publish.mjs <slug> [--draft] [--keep-date]
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const setDraft = args.includes('--draft');
const keepDate = args.includes('--keep-date');

if (!slug) {
  console.error('usage: npm run publish -- <slug> [--draft] [--keep-date]');
  process.exit(1);
}

const files = (await readdir(BLOG_DIR)).filter(
  (f) => f.endsWith('.mdx') && f.includes(slug),
);

if (files.length === 0) {
  console.error(`No article matches "${slug}"`);
  process.exit(1);
}
if (files.length > 1) {
  console.error(`Ambiguous "${slug}" matches ${files.length} articles:`);
  for (const f of files) console.error(`  - ${f}`);
  process.exit(1);
}

const file = files[0];
const path = join(BLOG_DIR, file);
let content = await readFile(path, 'utf8');

// draft field: update or insert
const draftValue = setDraft ? 'true' : 'false';
if (/^draft:\s*\S+/m.test(content)) {
  content = content.replace(/^draft:\s*\S+/m, `draft: ${draftValue}`);
} else if (/^---\r?\n[\s\S]*?^---\r?\n/m.test(content)) {
  content = content.replace(/^(---\r?\n[\s\S]*?)(^---\r?\n)/m, `$1draft: ${draftValue}\n$2`);
}

// date: update to today (unless --keep-date or --draft)
if (!keepDate && !setDraft) {
  const today = new Date().toISOString().slice(0, 10);
  if (/^date:\s*\S+/m.test(content)) {
    content = content.replace(/^date:\s*\S+/m, `date: ${today}`);
  }
}

await writeFile(path, content);
const verb = setDraft ? '↩ Repassé en brouillon' : '✔ Publié';
console.log(`${verb} : ${file}`);
if (!keepDate && !setDraft) {
  console.log(`  Date mise à aujourd'hui.`);
}
console.log('');
console.log('Push : git add ' + `poc-astro/src/content/blog/${file}` + ' && git commit -m "publish: ' + slug + '" && git push');
