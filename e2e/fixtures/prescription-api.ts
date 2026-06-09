import { Page } from '@playwright/test';
import { createMockToken, mockProfile, setupMarketplaceMocks } from './marketplace-api';

export const mockPrescriptionProduct = {
  id: 9,
  name: 'Amoxicilina 500mg',
  price: 34.9,
  discount: 0,
  stock: 30,
  description: 'Antibiótico de amplo espectro.',
  category: 'Antibióticos',
  requires_prescription: true,
  allows_subscription: false,
  pharmacy_id: null,
  Images: [{ thumb_img: '/defaultmed.png', img1: '/defaultmed.png' }]
};

export async function setupPrescriptionMocks(page: Page) {
  await setupMarketplaceMocks(page);

  await page.route('**/api/product/*', async (route) => {
    const url = route.request().url();
    if (route.request().method() === 'GET' && /\/product\/9$/.test(url)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPrescriptionProduct)
      });
    }
    await route.fallback();
  });

  await page.route('**/api/prescriptions', async (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'rx-new',
          medicine_id: 9,
          status: 'pending',
          file_url: 'https://example.com/rx.pdf'
        })
      });
    }
    await route.fallback();
  });
}

export { createMockToken, mockProfile };
