import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Using relative paths for better compatibility
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
});
