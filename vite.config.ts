import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'plugin.js'
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom/client',
        '@toolbox/sdk'
      ]
    },
    emptyOutDir: true,
    sourcemap: true
  }
});
