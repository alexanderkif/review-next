import { defineConfig, devices } from '@playwright/test';

const noDatabaseUrl = 'postgresql://127.0.0.1:1/e2e_disabled';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['list'], ['junit', { outputFile: 'test-results/e2e-junit.xml' }]]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node scripts/e2e-server.mjs',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      ...process.env,
      E2E_NO_DATABASE: '1',
      POSTGRES_URL: noDatabaseUrl,
      NEXTAUTH_URL: 'http://127.0.0.1:3100',
      NEXTAUTH_SECRET: 'e2e-only-not-a-production-secret',
    },
  },
});
