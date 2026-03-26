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
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@toolbox/sdk'
      ]
    },
    emptyOutDir: true,
    sourcemap: true
  }
});
