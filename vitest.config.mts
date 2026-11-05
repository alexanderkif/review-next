import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['app/lib/safe-callback-path.ts', 'app/lib/image-utils.ts', 'app/types/schemas.ts'],
      exclude: ['app/types/schemas.ts'],
      thresholds: {
        'app/lib/safe-callback-path.ts': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
        'app/lib/image-utils.ts': {
          branches: 85,
        },
      },
    },
  },
});
