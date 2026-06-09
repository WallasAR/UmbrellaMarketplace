import { test, expect } from '@playwright/test';
import {
  createAdminToken,
  mockAdminMetrics,
  mockAdminStats,
  mockPendingPharmacy,
  setupAdminMocks
} from './fixtures/admin-api';

test.describe('Admin dashboard (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminMocks(page);
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createAdminToken());
  });

  test('loads admin panel with platform metrics', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Painel administrativo' })).toBeVisible();
    await expect(page.getByText(String(mockAdminStats.users))).toBeVisible();
    await expect(page.getByText(`${mockAdminMetrics.conversionRate}%`)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Conversão diária (%)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Financeiro da plataforma' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Receita diária (GMV)' })).toBeVisible();
  });

  test('shows pending pharmacy and approves registration', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByText(mockPendingPharmacy.name)).toBeVisible();
    await expect(page.getByText(mockPendingPharmacy.owner.email)).toBeVisible();

    const approveRequest = page.waitForRequest((req) =>
      req.method() === 'PATCH' && req.url().includes('/admin/pharmacies/') && req.url().includes('/approve')
    );

    await page.getByRole('button', { name: 'Aprovar' }).first().click();
    await approveRequest;
  });
});
