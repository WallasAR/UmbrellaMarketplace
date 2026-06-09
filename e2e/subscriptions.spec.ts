import { test, expect } from '@playwright/test';
import {
  createMockToken,
  mockSubscription,
  setupSubscriptionsMocks
} from './fixtures/subscriptions-api';

test.describe('Subscriptions (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await setupSubscriptionsMocks(page);
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createMockToken());
  });

  test('lists active subscriptions', async ({ page }) => {
    await page.goto('/subscriptions');

    await expect(page.getByRole('heading', { name: 'Minhas assinaturas' })).toBeVisible();
    await expect(page.getByRole('heading', { name: mockSubscription.Medicine.name })).toBeVisible();
    await expect(page.getByText(/Status: active/i)).toBeVisible();
  });

  test('cancels an active subscription', async ({ page }) => {
    await page.goto('/subscriptions');

    const cancelRequest = page.waitForRequest((req) =>
      req.method() === 'DELETE' && req.url().includes(`/subscriptions/${mockSubscription.id}`)
    );

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await cancelRequest;
    await expect(page.getByText('Assinatura cancelada.')).toBeVisible();
  });
});
