import { Page } from '@playwright/test';

export const mockProduct = {
  id: 1,
  name: 'Dipirona 500mg',
  price: 12.5,
  discount: 0,
  stock: 50,
  description: 'Analgésico e antitérmico.',
  category: 'Analgésicos',
  requires_prescription: false,
  allows_subscription: false,
  pharmacy_id: null,
  Images: [{ thumb_img: '/defaultmed.png', img1: '/defaultmed.png' }]
};

export const mockProfile = {
  id: 'e2e-user',
  email: 'e2e@test.com',
  name: 'Cliente E2E',
  phone: '11999999999',
  cep: '01310100',
  address: 'Av. Paulista, 1000',
  role: 'customer'
};

export function createMockToken() {
  const payload = Buffer.from(
    JSON.stringify({ id: 'e2e-user', email: 'e2e@test.com', role: 'customer' })
  ).toString('base64');
  return `e2e.${payload}.signature`;
}

export async function setupMarketplaceMocks(page: Page) {
  let cartItems: Array<{
    medicine_id: number;
    quantity: number;
    Medicine: typeof mockProduct;
  }> = [];

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/.*\/api/, '/api');
    const method = route.request().method();

    if (method === 'POST' && path.endsWith('/auth/login')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Login successful', token: createMockToken() })
      });
    }

    if (method === 'GET' && path.endsWith('/product/list')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockProduct])
      });
    }

    if (method === 'GET' && path.endsWith('/product/categories')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['Analgésicos'])
      });
    }

    if (method === 'GET' && path.match(/\/product\/\d+$/)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProduct)
      });
    }

    if (method === 'POST' && path.endsWith('/cart/add')) {
      const body = route.request().postDataJSON() as { medicine_id: number; quantity: number };
      cartItems = [{
        medicine_id: body.medicine_id,
        quantity: body.quantity,
        Medicine: mockProduct
      }];
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Product added successfully' })
      });
    }

    if (method === 'GET' && path.endsWith('/cart/list')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(cartItems)
      });
    }

    if (method === 'GET' && path.endsWith('/user/profile')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProfile)
      });
    }

    if (method === 'GET' && path.endsWith('/notifications')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }

    if (method === 'POST' && path.endsWith('/coupons/validate')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'coupon-e2e',
          code: 'UMBRELLA10',
          discount_type: 'percentage',
          discount_value: 10
        })
      });
    }

    if (method === 'POST' && path.endsWith('/checkout/cart')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mode: 'single', url: 'https://checkout.stripe.test/e2e-session' })
      });
    }

    if (method === 'GET' && path.match(/\/reviews\/product\/\d+$/)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reviews: [], summary: { average: 0, count: 0 } })
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({})
    });
  });
}
