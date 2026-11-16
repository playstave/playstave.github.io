import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { loadEnv, type Plugin } from 'vite';

/**
 * ads.txt (required by AdSense): written into the build ONLY when a real
 * publisher ID is configured, so no placeholder ever ships.
 */
function adsTxt(): Plugin {
  let client = '';
  return {
    name: 'stave-ads-txt',
    configResolved(c) { client = loadEnv(c.mode, process.cwd(), 'VITE_').VITE_ADSENSE_CLIENT?.trim() ?? ''; },
    generateBundle() {
      if (!/^ca-pub-\d{10,20}$/.test(client)) return;
      this.emitFile({ type: 'asset', fileName: 'ads.txt', source: `google.com, ${client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n` });
    },
  };
}

// PHONE=1: serve over https on the local network so a phone can use the microphone
// (browsers only allow the mic on secure pages). Uses a self-signed certificate.
const phone = process.env.PHONE === '1';

/**
 * GitHub Pages serves the site from /<repo>/ and shows 404.html for unknown
 * paths, so a copy of index.html there lets /stave/level/12 open on refresh.
 */
function spaFallback(): Plugin {
  return {
    name: 'stave-404-fallback',
    apply: 'build',
    writeBundle(o) {
      const dir = o.dir ?? 'dist';
      if (existsSync(join(dir, 'index.html'))) copyFileSync(join(dir, 'index.html'), join(dir, '404.html'));
    },
  };
}

// BASE_PATH=/stave/ when building for GitHub Pages; '/' everywhere else.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react(), adsTxt(), spaFallback(), ...(phone ? [basicSsl()] : [])],
  server: phone ? { port: 5182, strictPort: true, host: true } : { port: 5180, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { vexflow: ['vexflow'] },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
