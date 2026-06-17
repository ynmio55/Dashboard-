import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ODC/',
  server: {
    host: 'localhost',
    port: 4173,
  },
  preview: {
    host: 'localhost',
    port: 4173,
  }
});
