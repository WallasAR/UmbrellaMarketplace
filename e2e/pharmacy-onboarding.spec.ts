import { test, expect } from '@playwright/test';
import { createMockToken, mockPlans, setupOnboardingMocks } from './fixtures/onboarding-api';

test.describe('Pharmacy onboarding (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await setupOnboardingMocks(page);
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createMockToken());
  });

  test('loads SaaS plans and submits registration', async ({ page }) => {
    await page.goto('/pharmacy/register');

    await expect(page.getByRole('heading', { name: 'Cadastre sua farmácia' })).toBeVisible();
    await expect(page.getByText(mockPlans[1].name)).toBeVisible();

    await page.getByRole('button', { name: mockPlans[1].name }).click();

    const registerRequest = page.waitForRequest((req) =>
      req.method() === 'POST' && req.url().includes('/onboarding/register')
    );

    await page.getByPlaceholder('Nome da farmácia').fill('Farmácia Nova LTDA');
    await page.getByPlaceholder('CNPJ').fill('12345678000199');
    await page.getByPlaceholder('Endereço').fill('Rua das Flores, 100');
    await page.getByPlaceholder('Cidade').fill('São Paulo');
    await page.getByPlaceholder('Estado').fill('SP');
    await page.getByPlaceholder('CEP').fill('01310100');
    await page.getByPlaceholder('Telefone').fill('11988887777');
    await page.getByRole('button', { name: 'Enviar cadastro' }).click();

    const request = await registerRequest;
    const body = request.postDataJSON() as { name: string; plan_tier: string };
    expect(body.name).toBe('Farmácia Nova LTDA');
    expect(body.plan_tier).toBe('pro');

    await expect(page.getByText('Cadastro enviado para análise.')).toBeVisible();
    await expect(page.getByText('Cadastro em análise')).toBeVisible();
  });
});
