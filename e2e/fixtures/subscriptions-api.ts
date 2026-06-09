import { Page } from '@playwright/test';
import { createMockToken } from './marketplace-api';

export const mockSubscription = {
  id: 'sub-e2e-1',
  medicine_id: 2,
  quantity: 2,
  status: 'active',
  interval_days: 30,
  next_delivery_at: '2026-07-01T00:00:00.000Z',
  Medicine: {
    id: 2,
    name: 'Losartana 50mg',
    price: 28.9,
    discount: 0,
    Images: [{ thumb_img: '/defaultmed.png' }]
  }
};

export async function setupSubscriptionsMocks(page: Page) {
  let subscriptions = [mockSubscription];

  await page.route('**/api/subscriptions**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (method === 'GET' && url.pathname.endsWith('/subscriptions')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(subscriptions)
      });
    }

    if (method === 'DELETE') {
      const id = url.pathname.split('/').pop();
      subscriptions = subscriptions.filter((sub) => sub.id !== id);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Subscription cancelled' })
      });
    }

    return route.continue();
  });

  await page.route('**/api/notifications**', async (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  );
}

export { createMockToken };
