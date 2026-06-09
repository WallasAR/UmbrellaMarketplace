import { test, expect } from '@playwright/test';
import {
  createMockToken,
  installPushMocks,
  mockPrescription,
  mockProfile,
  setupProfileMocks
} from './fixtures/profile-api';

test.describe('Profile (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileMocks(page);
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createMockToken());
  });

  test('loads profile and saves changes', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible();
    await expect(page.locator('#name')).toHaveValue(mockProfile.name);

    const saveRequest = page.waitForRequest((req) =>
      req.method() === 'PUT' && req.url().includes('/user/edit')
    );

    await page.locator('#name').fill('Cliente Atualizado');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();

    const request = await saveRequest;
    const body = request.postDataJSON() as { name: string };
    expect(body.name).toBe('Cliente Atualizado');
    await expect(page.getByText('Perfil atualizado com sucesso.')).toBeVisible();
  });

  test('lists prescriptions on profile page', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByText(mockPrescription.Medicine.name)).toBeVisible();
    await expect(page.getByText('approved')).toBeVisible();
  });

  test('enables push notifications with mocked browser APIs', async ({ page }) => {
    await installPushMocks(page);

    const subscribeRequest = page.waitForRequest((req) =>
      req.method() === 'POST' && req.url().includes('/notifications/push-subscribe')
    );

    await page.goto('/profile');
    await page.getByRole('button', { name: 'Ativar notificações' }).click();

    await subscribeRequest;
    await expect(page.getByText('Notificações push ativadas.')).toBeVisible();
  });
});
