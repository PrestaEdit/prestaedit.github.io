import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const BLOG_DIR = 'src/content/blog';
const OUT_DIR = 'public/head';

const FAMILIES = {
  outillage: ['prestaflow', 'tests', 'outils', 'ci-cd', 'github'],
  plateforme: ['prestashop', 'prestashop-9', 'prestashop-8'],
  meta: ['annonce', 'events'],
  format: ['tutoriel', 'prestashop-dev-conference', 'insomnia'],
};

const GRADIENTS = {
  outillage: ['#059669', '#0d9488'],
  plateforme: ['#ea580c', '#c2410c'],
  meta: ['#475569', '#1e293b'],
  format: ['#7c3aed', '#db2777'],
  default: ['#1e40af', '#4338ca'],
};

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const familyFor = (tag) => {
  const s = slugify(tag);
  for (const [f, list] of Object.entries(FAMILIES)) if (list.includes(s)) return f;
  return 'default';
};

const primaryFamily = (tags) => {
  const priority = ['outillage', 'plateforme', 'format', 'meta'];
  const seen = new Set(tags.map(familyFor));
  return priority.find((f) => seen.has(f)) ?? 'default';
};

// Very simple frontmatter parser: title, tags, featuredimg
function parseFrontmatter(mdx) {
  const m = mdx.match(/^---\r?\n([\s\S]*?)^---/m);
  if (!m) return null;
  const fm = m[1];
  const title = fm.match(/^title:\s*"?([^"\n]+)"?/m)?.[1]?.trim();
  const featuredimg = fm.match(/^featuredimg:\s*'?([^'\n]+)'?/m)?.[1]?.trim();
  const tags = [];
  const tagsBlock = fm.match(/^tags:\s*\n((?:\s*-\s*[^\n]+\n)+)/m);
  if (tagsBlock) {
    for (const line of tagsBlock[1].split('\n')) {
      const t = line.replace(/^\s*-\s*/, '').trim();
      if (t) tags.push(t);
    }
  }
  return { title, tags, featuredimg };
}

// Wrap SVG text into up to 3 lines of ~30 chars
function wrapTitle(title, maxLine = 34, maxLines = 3) {
  const words = title.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxLine) {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (words.length > lines.join(' ').split(/\s+/).length) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/[.,;:!?]*$/, '') + '…';
  }
  return lines;
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function svg({ title, family }) {
  const [c1, c2] = GRADIENTS[family];
  const lines = wrapTitle(title);
  const lineHeight = 42;
  const totalH = lines.length * lineHeight;
  const startY = 225 - totalH / 2 + lineHeight * 0.35;
  const tspans = lines
    .map((l, i) => `<tspan x="400" y="${startY + i * lineHeight}">${escapeXml(l)}</tspan>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <rect width="800" height="450" fill="url(#grid)"/>
  <g transform="translate(40 40)" fill="rgba(255,255,255,0.9)">
    <path transform="translate(0 4)" d="M14 0L28 8v16L14 32 0 24V8z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
    <text x="42" y="26" font-family="ui-sans-serif,system-ui,-apple-system,sans-serif" font-size="14" font-weight="600" letter-spacing="0.08em">PRESTAEDIT</text>
  </g>
  <text text-anchor="middle" fill="white" font-family="ui-sans-serif,system-ui,-apple-system,sans-serif" font-size="32" font-weight="700">${tspans}</text>
</svg>
`;
}

// Extract cover slug from featuredimg URL (last segment without extension)
function coverSlug(featuredimg, fallback) {
  if (!featuredimg) return fallback;
  const base = basename(featuredimg).replace(/\.[a-z]+$/i, '');
  return base;
}

const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.mdx'));
let written = 0;
for (const file of files) {
  const raw = await readFile(join(BLOG_DIR, file), 'utf8');
  const fm = parseFrontmatter(raw);
  if (!fm?.title) continue;
  const slug = coverSlug(fm.featuredimg, file.replace(/\.mdx$/, ''));
  const family = primaryFamily(fm.tags);
  await writeFile(join(OUT_DIR, `${slug}.svg`), svg({ title: fm.title, family }));
  written++;
}
console.log(`Wrote ${written} covers.`);
