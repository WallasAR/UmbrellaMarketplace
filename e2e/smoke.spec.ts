import { test, expect } from '@playwright/test';

test.describe('Umbrella Marketplace smoke', () => {
  test('home page loads and shows products section', async ({ page }) => {
    await page.goto('/home');
    await expect(page.getByRole('heading', { name: /Medicamentos em destaque/i })).toBeVisible();
  });

  test('navigation links are reachable', async ({ page }) => {
    await page.goto('/home');
    await page.getByRole('link', { name: 'Categorias' }).click();
    await expect(page).toHaveURL(/category/);
    await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible();
  });

  test('auth page renders login form', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('heading', { name: /Bem-vindo de volta/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('unknown route shows 404 page', async ({ page }) => {
    await page.goto('/rota-inexistente');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });
});
