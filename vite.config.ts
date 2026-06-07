import { defineConfig } from 'vite';

export default defineConfig({
  base: '/senaturen/', // Set to your repository name for GitHub Pages
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
});
