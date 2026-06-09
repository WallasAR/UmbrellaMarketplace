import { test, expect } from '@playwright/test';
import {
  createMockToken,
  mockPrescriptionProduct,
  setupPrescriptionMocks
} from './fixtures/prescription-api';

test.describe('Prescription upload (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPrescriptionMocks(page);
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, createMockToken());
  });

  test('shows upload UI for prescription-only medicine', async ({ page }) => {
    await page.goto('/product/9');

    await expect(page.getByRole('heading', { name: mockPrescriptionProduct.name })).toBeVisible();
    await expect(page.getByText('Medicamento sob prescrição médica')).toBeVisible();
    await expect(page.getByText('Enviar receita')).toBeVisible();
  });

  test('uploads prescription file', async ({ page }) => {
    await page.goto('/product/9');

    const uploadResponse = page.waitForResponse((res) =>
      res.request().method() === 'POST' && res.url().includes('/prescriptions') && !res.url().includes('/pending')
    );

    await page.getByLabel('Selecionar arquivo de receita médica').setInputFiles({
      name: 'receita.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 fake prescription content for e2e')
    });

    const response = await uploadResponse;
    expect(response.ok()).toBeTruthy();

    const body = response.request().postDataJSON() as { medicine_id: number; file_name: string; file_data: string };
    expect(body.medicine_id).toBe(mockPrescriptionProduct.id);
    expect(body.file_name).toBe('receita.pdf');
    expect(body.file_data.length).toBeGreaterThan(20);

    await expect(page.getByText('Enviar receita')).toBeVisible();
    await expect(page.getByText('Enviando...')).toHaveCount(0);
  });
});
