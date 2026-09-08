import { configDefaults, defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

/** Vitest 配置。 */
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    environmentMatchGlobs: [['**/*.component.test.ts', 'happy-dom']],
    coverage: {
      provider: 'v8',
      all: true,
      include: ['packages/{components,hooks,utils,theme}/src/**/*.{ts,vue}'],
      exclude: ['**/*.{test,spec}.ts', '**/*.d.ts'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 30,
        branches: 60,
        functions: 45,
        lines: 30,
      },
    },
    /** 这些脚本使用 Node.js 原生 test runner，由各自的 package script 执行。 */
    exclude: [
      ...configDefaults.exclude,
      'scripts/check-registry-artifacts.test.mjs',
      'scripts/generate-home-releases.test.js',
      'scripts/lib/release-packages.test.js',
      'packages/skills-cli/lib/sync.test.js',
    ],
  },
});
