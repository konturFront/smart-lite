import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), viteSingleFile()],
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks(id) {
  //         if (id.includes('node_modules')) {
  //           return 'vendor'; // Все node_modules в vendor.js
  //         }
  //
  //         if (id.includes('pages/DeviceCard')) {
  //           return 'device-card'; // Страница DeviceCard отдельно
  //         }
  //
  //         // Всё остальное идёт в main.js
  //         return 'main';
  //       },
  //       chunkFileNames: '[name].js',
  //       entryFileNames: '[name].js',
  //       assetFileNames: '[name].[ext]',
  //     },
  //   },
  // },
  base: '/kontur/',
  build: {
    target: 'esnext',
    minify: 'esbuild',
    assetsInlineLimit: Infinity,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
