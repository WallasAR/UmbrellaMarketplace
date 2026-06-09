import { test, expect } from '@playwright/test';
import { createMockToken, mockProduct, setupMarketplaceMocks } from './fixtures/marketplace-api';

test.describe('Checkout with coupon (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMarketplaceMocks(page);
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createMockToken());
  });

  test('applies coupon and sends it on checkout', async ({ page }) => {
    await page.goto('/product/1');
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/checkout');

    await expect(page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible();

    const validateRequest = page.waitForRequest((req) =>
      req.method() === 'POST' && req.url().includes('/coupons/validate')
    );

    await page.getByLabel('Código do cupom').fill('UMBRELLA10');
    await page.getByRole('button', { name: 'Aplicar' }).click();

    const couponRequest = await validateRequest;
    const couponBody = couponRequest.postDataJSON() as { code: string };
    expect(couponBody.code).toBe('UMBRELLA10');
    await expect(page.getByText('Cupom aplicado com sucesso.')).toBeVisible();

    const checkoutRequest = page.waitForRequest((req) =>
      req.method() === 'POST' && req.url().includes('/checkout/cart')
    );

    await page.getByRole('button', { name: 'Pagar com segurança' }).click();

    const paymentRequest = await checkoutRequest;
    const checkoutBody = paymentRequest.postDataJSON() as { couponCode: string };
    expect(checkoutBody.couponCode).toBe('UMBRELLA10');
  });

  test('shows delivery profile on checkout', async ({ page }) => {
    await page.goto('/product/1');
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/checkout');

    await expect(page.getByText(mockProduct.name)).toBeVisible();
    await expect(page.getByText('Av. Paulista, 1000')).toBeVisible();
  });
});
