import { test, expect } from '@playwright/test';
import { createMockToken, mockProduct, setupMarketplaceMocks } from './fixtures/marketplace-api';
import { checkoutPayButton, selectPickupOnCheckout } from './fixtures/checkout-helpers';

test.describe('Integrated shopping flow (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMarketplaceMocks(page);
  });

  test('login via UI and reach authenticated home', async ({ page }) => {
    await page.goto('/auth');
    await page.locator('input[placeholder="Email"]').fill('e2e@test.com');
    await page.locator('input[placeholder="Senha"]').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/home/);
    await expect(page.getByRole('button', { name: 'Menu do usuário' })).toBeVisible();
  });

  test('browse product, add to cart and open checkout', async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createMockToken());

    await page.goto('/home');
    await expect(page.getByRole('heading', { name: /Medicamentos em destaque/i })).toBeVisible();

    await page.getByRole('link', { name: 'Ver detalhes' }).first().click();
    await expect(page).toHaveURL(/product\/1/);
    await expect(page.getByRole('heading', { name: mockProduct.name })).toBeVisible();

    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Seu carrinho' })).toBeVisible();
    await expect(page.getByText(mockProduct.name)).toBeVisible();

    await page.getByRole('link', { name: 'Ir para checkout' }).click();
    await expect(page).toHaveURL(/checkout/);
    await expect(page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pagar com segurança' })).toBeVisible();
  });

  test('checkout triggers payment session request', async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createMockToken());

    let checkoutRequested = false;
    await page.route('**/api/checkout/cart', async (route) => {
      checkoutRequested = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mode: 'single', url: 'https://checkout.stripe.test/e2e-session' })
      });
    });

    await page.goto('/product/1');
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/checkout');
    await selectPickupOnCheckout(page);
    await checkoutPayButton(page).click();

    await expect.poll(() => checkoutRequested).toBe(true);
  });
});
