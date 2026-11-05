import { expect, test } from '@playwright/test';

test('home page shows its empty-CV state', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'CV Not Found' })).toBeVisible();
});

test('projects page renders without database data and remains horizontally contained', async ({
  page,
}) => {
  await page.goto('/projects');

  await expect(page.getByRole('heading', { name: 'Projects Portfolio' })).toBeAttached();
  await expect(page.getByText('Completed Projects')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test('unknown project IDs render the not-found page', async ({ page }) => {
  const response = await page.goto('/projects/2147483647');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
});

test('login form validates missing fields without contacting the auth API', async ({ page }) => {
  const authRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/auth/callback/credentials')) {
      authRequests.push(request.url());
    }
  });

  await page.goto('/auth/login');
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.getByText('Email is required')).toBeVisible();
  await expect(page.getByText('Password is required')).toBeVisible();
  expect(authRequests).toEqual([]);
});
