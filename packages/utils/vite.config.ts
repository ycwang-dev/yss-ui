import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      entryRoot: resolve(__dirname, 'src'),
      outDir: resolve(__dirname, 'dist'),
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      insertTypesEntry: false,
      copyDtsFiles: false,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'yss-ui-utils',
      fileName: format => (format === 'es' ? 'index.mjs' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [],
    },
    target: 'es2018',
    sourcemap: false,
    minify: false,
    emptyOutDir: true,
  },
});
