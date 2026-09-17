import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // El sitio se publica en GitHub Pages bajo /panel-divisas/, no en la raíz.
  base: process.env.BASE_URL ?? '/panel-divisas/',
  build: { outDir: 'dist', sourcemap: true },
});
