import { test, expect } from '@playwright/test';
import {
  createMockToken,
  mockMultiCheckoutResponse,
  productA,
  productB,
  setupMultiCheckoutMocks
} from './fixtures/multi-checkout-api';

test.describe('Multi-pharmacy checkout (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMultiCheckoutMocks(page);
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createMockToken());
  });

  test('shows items from multiple pharmacies in cart summary', async ({ page }) => {
    await page.goto('/checkout');

    await expect(page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible();
    await expect(page.getByText(productA.name)).toBeVisible();
    await expect(page.getByText(productB.name)).toBeVisible();
  });

  test('returns separate Stripe sessions per pharmacy', async ({ page }) => {
    await page.goto('/checkout');

    const checkoutRequest = page.waitForRequest((req) =>
      req.method() === 'POST' && req.url().includes('/checkout/cart')
    );

    await page.getByRole('button', { name: 'Pagar com segurança' }).click();
    await checkoutRequest;

    await expect(page.getByText('Pagamentos por farmácia')).toBeVisible();
    await expect(page.getByRole('link', { name: /Farmácia Central/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Farmácia Norte/ })).toBeVisible();
    await expect(page.getByText('1 item(ns) · Pagar agora')).toBeVisible();
    await expect(page.getByText('2 item(ns) · Pagar agora')).toBeVisible();

    const paymentLinks = page.locator('a[href*="checkout.stripe.test"]');
    await expect(paymentLinks).toHaveCount(2);
  });
});
