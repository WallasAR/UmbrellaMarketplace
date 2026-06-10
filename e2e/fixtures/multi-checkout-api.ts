import { Page } from '@playwright/test';
import { createMockToken, mockProfile, setupMarketplaceMocks } from './marketplace-api';

const pharmacyA = 'aaaaaaaa-1111-1111-1111-111111111111';
const pharmacyB = 'bbbbbbbb-2222-2222-2222-222222222222';

const productA = {
  id: 1,
  name: 'Dipirona Farmácia Central',
  price: 12.5,
  discount: 0,
  stock: 50,
  description: 'Analgésico.',
  category: 'Analgésicos',
  requires_prescription: false,
  allows_subscription: false,
  pharmacy_id: pharmacyA,
  Images: [{ thumb_img: '/defaultmed.png', img1: '/defaultmed.png' }]
};

const productB = {
  id: 2,
  name: 'Losartana Farmácia Norte',
  price: 28.9,
  discount: 0,
  stock: 40,
  description: 'Anti-hipertensivo.',
  category: 'Cardiologia',
  requires_prescription: false,
  allows_subscription: false,
  pharmacy_id: pharmacyB,
  Images: [{ thumb_img: '/defaultmed.png', img1: '/defaultmed.png' }]
};

const cartItems = [
  { medicine_id: 1, quantity: 1, Medicine: productA },
  { medicine_id: 2, quantity: 2, Medicine: productB }
];

export const mockMultiCheckoutResponse = {
  mode: 'multi',
  sessions: [
    {
      pharmacyId: pharmacyA,
      pharmacyName: 'Farmácia Central',
      url: 'https://checkout.stripe.test/session-central',
      items: 1
    },
    {
      pharmacyId: pharmacyB,
      pharmacyName: 'Farmácia Norte',
      url: 'https://checkout.stripe.test/session-norte',
      items: 2
    }
  ]
};

export const mockUnifiedCheckoutResponse = {
  mode: 'unified',
  url: 'https://checkout.stripe.test/unified-session',
  pharmacy_count: 2
};

export async function setupMultiCheckoutMocks(page: Page) {
  await setupMarketplaceMocks(page);

  await page.route('**/api/cart/list', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(cartItems)
    })
  );

  await page.route('**/api/checkout/cart', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUnifiedCheckoutResponse)
    })
  );
}

export { createMockToken, mockProfile, productA, productB };
