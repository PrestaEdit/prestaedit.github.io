import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '..', 'src', 'content', 'blog');
const OUT_DIR = join(__dirname, '..', 'public', 'head');
const FONTS_DIR = join(__dirname, 'fonts');

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

const FAMILY_LABEL = {
  outillage: 'Outillage',
  plateforme: 'Plateforme',
  meta: 'Actualité',
  format: 'Format',
  default: 'Article',
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

function parseFrontmatter(mdx) {
  const m = mdx.match(/^---\r?\n([\s\S]*?)^---/m);
  if (!m) return null;
  const fm = m[1];
  const title = fm.match(/^title:\s*"?([^"\n]+?)"?\s*$/m)?.[1]?.trim();
  const featuredimg = fm.match(/^featuredimg:\s*'?([^'\n]+?)'?\s*$/m)?.[1]?.trim();
  const series = fm.match(/^series:\s*(\S+)/m)?.[1]?.trim();
  const tags = [];
  const tagsBlock = fm.match(/^tags:\s*\n((?:\s*-\s*[^\n]+\n)+)/m);
  if (tagsBlock) {
    for (const line of tagsBlock[1].split('\n')) {
      const t = line.replace(/^\s*-\s*/, '').trim();
      if (t) tags.push(t);
    }
  }
  return { title, tags, featuredimg, series };
}

function coverSlug(featuredimg, fallback) {
  if (!featuredimg) return fallback;
  return basename(featuredimg).replace(/\.[a-z]+$/i, '');
}

const el = (type, props, ...children) => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
});

function template({ title, family, series }) {
  const [c1, c2] = GRADIENTS[family];
  const label = FAMILY_LABEL[family];
  return el('div', {
    style: {
      width: '1200px', height: '630px',
      display: 'flex', flexDirection: 'column',
      padding: '72px 88px',
      backgroundImage: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
      color: 'white',
      fontFamily: 'Inter',
      position: 'relative',
    },
  },
    // top row: brand + family label
    el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
      el('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
        // hex icon
        el('svg', { width: 44, height: 44, viewBox: '0 0 44 44' },
          el('path', {
            d: 'M22 4L38 12v20L22 40 6 32V12z',
            fill: 'rgba(255,255,255,0.15)',
            stroke: 'rgba(255,255,255,0.75)',
            strokeWidth: 2,
          })
        ),
        el('div', { style: { display: 'flex', flexDirection: 'column' } },
          el('div', { style: { fontSize: 26, fontWeight: 700, letterSpacing: '0.05em' } }, 'PRESTAEDIT'),
          el('div', { style: { fontSize: 16, opacity: 0.8, marginTop: '-2px' } }, 'PrestaShop, sous le capot')
        )
      ),
      el('div', {
        style: {
          fontSize: 18, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '8px 18px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
        },
      }, label)
    ),
    // spacer
    el('div', { style: { flex: 1, display: 'flex' } }),
    // title
    el('div', {
      style: {
        fontSize: title.length > 60 ? 56 : 68,
        fontWeight: 700, lineHeight: 1.15,
        maxWidth: '1000px',
        display: 'flex',
      },
    }, title),
    // series footer
    series
      ? el('div', {
          style: {
            marginTop: '32px', fontSize: 22, opacity: 0.85,
            display: 'flex', alignItems: 'center', gap: '12px',
          },
        },
          el('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'currentColor' },
            el('path', { d: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z' })
          ),
          `Série ${series.charAt(0).toUpperCase()}${series.slice(1)}`
        )
      : null
  );
}

const [regular, bold] = await Promise.all([
  readFile(join(FONTS_DIR, 'Inter-Regular.ttf')),
  readFile(join(FONTS_DIR, 'Inter-Bold.ttf')),
]);

const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.mdx'));
let ok = 0;
for (const file of files) {
  const raw = await readFile(join(BLOG_DIR, file), 'utf8');
  const fm = parseFrontmatter(raw);
  if (!fm?.title) continue;
  const slug = coverSlug(fm.featuredimg, file.replace(/\.mdx$/, ''));
  const family = primaryFamily(fm.tags);

  const svg = await satori(template({ title: fm.title, family, series: fm.series }), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ],
  });

  await writeFile(join(OUT_DIR, `${slug}.svg`), svg);

  // OG PNG (social media compat)
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  await writeFile(join(OUT_DIR, `${slug}.png`), png);

  ok++;
}
console.log(`Wrote ${ok} covers (SVG + PNG).`);
