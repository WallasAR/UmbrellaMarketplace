import { test, expect } from '@playwright/test';
import {
  createPharmacistToken,
  mockPharmacyDashboard,
  mockPharmacyMetrics,
  setupPharmacyMocks
} from './fixtures/pharmacy-api';

test.describe('Pharmacy dashboard (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPharmacyMocks(page);
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createPharmacistToken());
  });

  test('loads pharmacy panel with dashboard metrics', async ({ page }) => {
    await page.goto('/pharmacy');

    await expect(page.getByRole('heading', { name: 'Painel da farmácia' })).toBeVisible();
    await expect(page.getByText(mockPharmacyDashboard.pharmacy.name)).toBeVisible();
    await expect(page.getByText(String(mockPharmacyDashboard.productCount))).toBeVisible();
    await expect(page.getByText(`${mockPharmacyMetrics.conversionRate}%`)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Conversão diária (%)' })).toBeVisible();
  });

  test('financial tab shows revenue chart', async ({ page }) => {
    await page.goto('/pharmacy');
    await page.getByRole('button', { name: 'Financeiro' }).click();

    await expect(page.getByRole('heading', { name: 'Receita diária' })).toBeVisible();
    await expect(page.getByText('Receita bruta')).toBeVisible();
  });
});
