import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { __DEV__ } from './src/global/value';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), viteSingleFile()],
  build: __DEV__
    ? {
        target: 'esnext',
        minify: 'esbuild',
        assetsInlineLimit: Infinity,
      }
    : {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                return 'vendor'; // Все node_modules в vendor.js
              }

              if (id.includes('pages/DeviceCard')) {
                return 'device-card'; // Страница DeviceCard отдельно
              }

              // Всё остальное идёт в main.js
              return 'main';
            },
            chunkFileNames: '[name].js',
            entryFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
          },
        },
      },
  server: __DEV__ && {
    host: '0.0.0.0',
    port: 5173,
  },
});
