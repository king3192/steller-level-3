import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    base: '/steller-level-3/',
    plugins: [react()],
    server: {
      port: 3001,
      open: true,
    },
    build: {
      sourcemap: !isProd,
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    }
  };
});
