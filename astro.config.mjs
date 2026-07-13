import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jpreki.top',
  output: 'static',
  build: {
    format: 'directory',
  },
});