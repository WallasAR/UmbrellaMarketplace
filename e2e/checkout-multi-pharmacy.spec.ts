import { test, expect } from '@playwright/test';
import {
  createMockToken,
  productA,
  productB,
  setupMultiCheckoutMocks
} from './fixtures/multi-checkout-api';
import { checkoutPayButton, selectPickupOnCheckout } from './fixtures/checkout-helpers';

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

  test('returns unified Stripe session for multi-pharmacy cart', async ({ page }) => {
    await page.goto('/checkout');

    await selectPickupOnCheckout(page);

    const checkoutRequest = page.waitForRequest((req) =>
      req.method() === 'POST' && req.url().includes('/checkout/cart')
    );

    await checkoutPayButton(page, true).click();

    const request = await checkoutRequest;
    const body = request.postDataJSON() as { fulfillment_mode?: string };
    expect(body.fulfillment_mode).toBe('pickup');
  });
});
