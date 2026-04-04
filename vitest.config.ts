import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
      exclude: [
        'scripts/**',
        '**/dist/**',
        '**/dist-testing/**',
        'docs/**',
        'examples/**',
      ],
    },
    setupFiles: ['test/setup.ts'],
    include: ['packages/**/test/**/*.test.ts', 'test/**/*.test.ts'],
  },
});
