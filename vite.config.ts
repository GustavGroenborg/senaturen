import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Set to '/' for custom domain (senaturen.dk)
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
});
