import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { server } from './tooling/server.ts';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    host: server.host,
    port: server.devPort,
    strictPort: true,
    fs: { deny: ['.env', '.env.*', '**/.git/**', '**/legacy/**', '**/design-reference/**', '**/.superpowers/**'] },
  },
  preview: { host: server.host, port: server.previewPort, strictPort: true },
  build: { manifest: true },
});
