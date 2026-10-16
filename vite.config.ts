import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = new URL(
    env.API_BASE_URL || 'https://sparkinterview-apim.azure-api.net/InterviewAPI',
  );
  const proxy = {
    '/api': {
      target: base.origin,
      changeOrigin: true,
      headers: { 'Ocp-Apim-Subscription-Key': env.API_KEY ?? '' },
      rewrite: (p: string) => p.replace(/^\/api/, base.pathname.replace(/\/$/, '')),
    },
  };
  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
    test: { environment: 'node' },
  };
});
