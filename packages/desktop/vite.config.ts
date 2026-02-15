import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  resolve: {
    // Ensure engine package resolves correctly in the monorepo
    preserveSymlinks: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
