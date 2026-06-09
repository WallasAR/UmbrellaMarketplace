import { test, expect } from '@playwright/test';

test.describe('Marketplace flows', () => {
  test('checkout cancel page shows recovery actions', async ({ page }) => {
    await page.goto('/checkout/cancel');
    await expect(page.getByRole('heading', { name: 'Pagamento cancelado' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Voltar ao carrinho' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar comprando' })).toBeVisible();
  });

  test('pharmacy register requires authentication', async ({ page }) => {
    await page.goto('/pharmacy/register');
    await expect(page).toHaveURL(/auth/);
  });

  test('cart requires authentication', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL(/auth/);
  });

  test('checkout requires authentication', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/auth/);
  });
});
