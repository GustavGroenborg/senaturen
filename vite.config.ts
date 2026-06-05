import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Using relative paths for deployment flexibility
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
});
