import { Page } from '@playwright/test';
import { createMockToken } from './marketplace-api';

export const mockPlans = [
  {
    id: 'plan-free',
    tier: 'free',
    name: 'Gratuito',
    monthly_price: 0,
    commission_rate: 0.15,
    max_products: 50
  },
  {
    id: 'plan-pro',
    tier: 'pro',
    name: 'Profissional',
    monthly_price: 99.9,
    commission_rate: 0.1,
    max_products: 500
  },
  {
    id: 'plan-enterprise',
    tier: 'enterprise',
    name: 'Empresarial',
    monthly_price: 299.9,
    commission_rate: 0.08,
    max_products: null
  }
];

export async function setupOnboardingMocks(page: Page) {
  await page.route('**/api/onboarding/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/.*\/api\/onboarding/, '/api/onboarding');
    const method = route.request().method();

    if (method === 'GET' && path.endsWith('/plans')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPlans)
      });
    }

    if (method === 'GET' && path.endsWith('/status')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'none' })
      });
    }

    if (method === 'POST' && path.endsWith('/register')) {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'pharm-new', onboarding_status: 'pending' })
      });
    }

    return route.continue();
  });

  await page.route('**/api/notifications**', async (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  );
}

export { createMockToken };
