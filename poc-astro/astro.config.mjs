import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://prestaedit.github.io',
  output: 'static',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [mdx(), react(), keystatic()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
});
