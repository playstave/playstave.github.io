import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// PHONE=1: serve over https on the local network so a phone can use the microphone
// (browsers only allow the mic on secure pages). Uses a self-signed certificate.
const phone = process.env.PHONE === '1';

export default defineConfig({
  plugins: [react(), ...(phone ? [basicSsl()] : [])],
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
