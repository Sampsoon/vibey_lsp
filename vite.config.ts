import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json';

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest: manifest as ManifestV3Export,
      browser: 'chrome',
    }),
  ],
  build: {
    outDir: 'dist',
    copyPublicDir: true,
  },
});
