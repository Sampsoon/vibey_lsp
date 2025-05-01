import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdirSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function listFilesInDirectory(dir: string): string[] {
  const absoluteDir = resolve(__dirname, dir);
  return readdirSync(absoluteDir)
    .map(name => join(absoluteDir, name))
    .filter(path => statSync(path).isFile());
}

function entryMap(paths: string[]): Record<string, string> {
  return Object.fromEntries(
    paths.map(path => [basename(path, extname(path)), path])
  );
}

const serviceWorkerInputMap = entryMap(listFilesInDirectory('src/serviceWorkers'));
const contentScriptInputMap = entryMap(listFilesInDirectory('src/contentScripts'));

const serviceWorkerInputNames = Object.keys(serviceWorkerInputMap);
const contentScriptInputNames = Object.keys(contentScriptInputMap);

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        ...serviceWorkerInputMap,
        ...contentScriptInputMap,
      },
      output: {
        entryFileNames: chunkInfo => {
          if (serviceWorkerInputNames.includes(chunkInfo.name)) {
            return 'serviceWorkers/[name].js';
          }
          if (contentScriptInputNames.includes(chunkInfo.name)) {
            return 'contentScripts/[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    copyPublicDir: true
  }
});
