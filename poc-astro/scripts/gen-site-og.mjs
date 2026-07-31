import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, 'fonts');
const OUT = join(__dirname, '..', 'public', 'og-default.png');

const el = (type, props, ...children) => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
});

const [regular, bold] = await Promise.all([
  readFile(join(FONTS_DIR, 'Inter-Regular.ttf')),
  readFile(join(FONTS_DIR, 'Inter-Bold.ttf')),
]);

const template = el('div', {
  style: {
    width: '1200px', height: '630px',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '80px 96px',
    backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #4338ca 100%)',
    color: 'white', fontFamily: 'Inter',
  },
},
  el('div', { style: { display: 'flex', alignItems: 'center', gap: '20px' } },
    el('svg', { width: 56, height: 56, viewBox: '0 0 44 44' },
      el('path', {
        d: 'M22 4L38 12v20L22 40 6 32V12z',
        fill: 'rgba(255,255,255,0.15)',
        stroke: 'rgba(255,255,255,0.75)',
        strokeWidth: 2,
      })
    ),
    el('div', { style: { display: 'flex', flexDirection: 'column' } },
      el('div', { style: { fontSize: 36, fontWeight: 700, letterSpacing: '0.05em' } }, 'PRESTAEDIT'),
      el('div', { style: { fontSize: 20, opacity: 0.8 } }, 'Blog technique de Jonathan Danse')
    )
  ),
  el('div', { style: { display: 'flex', fontSize: 92, fontWeight: 700, lineHeight: 1.05 } },
    'PrestaShop,\nsous le capot.'
  ),
  el('div', { style: { fontSize: 24, opacity: 0.75, display: 'flex' } },
    'blog.prestaedit.com'
  )
);

const svg = await satori(template, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'Inter', data: regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: bold, weight: 700, style: 'normal' },
  ],
});
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
await writeFile(OUT, png);
console.log(`Wrote ${OUT}`);
