import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  server: {
    hmr: {
      overlay: false, // Désactiver l'overlay pour les erreurs
    },
  },
  plugins: [vue()],
});
