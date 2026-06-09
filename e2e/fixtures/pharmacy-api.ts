import { Page } from '@playwright/test';

const pharmacyId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

export const mockPharmacyDashboard = {
  pharmacy: {
    id: pharmacyId,
    name: 'Farmácia E2E',
    operational_status: 'open',
    plan_tier: 'pro'
  },
  productCount: 12,
  batchCount: 4,
  orderCount: 8,
  revenue: 1540.5,
  lowStockCount: 2,
  expiringSoonCount: 1
};

export const mockPharmacyMetrics = {
  period: '30d',
  productCount: 12,
  lowStockProducts: 2,
  checkoutSessions: 20,
  paidSessions: 14,
  conversionRate: 70,
  paidRevenue: 1540.5,
  dailyConversion: [
    { date: '2026-06-01', checkoutSessions: 5, paidSessions: 3, conversionRate: 60 },
    { date: '2026-06-02', checkoutSessions: 8, paidSessions: 6, conversionRate: 75 },
    { date: '2026-06-03', checkoutSessions: 7, paidSessions: 5, conversionRate: 71.4 }
  ]
};

export const mockPharmacyFinancial = {
  pharmacy: 'Farmácia E2E',
  period: '30d',
  summary: { grossRevenue: 1540.5, platformFee: 154.05, netRevenue: 1386.45, orderCount: 8, itemCount: 12 },
  daily: [
    { date: '2026-06-01', revenue: 420, orders: 2 },
    { date: '2026-06-02', revenue: 680.5, orders: 3 },
    { date: '2026-06-03', revenue: 440, orders: 3 }
  ]
};

export function createPharmacistToken() {
  const payload = Buffer.from(
    JSON.stringify({
      id: 'pharm-e2e',
      email: 'farm@e2e.com',
      role: 'pharmacist',
      pharmacy_id: pharmacyId
    })
  ).toString('base64');

  return `e2e.${payload}.signature`;
}

export async function setupPharmacyMocks(page: Page) {
  await page.route('**/api/pharmacy/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/.*\/api\/pharmacy/, '/api/pharmacy');

    if (path.endsWith('/dashboard')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPharmacyDashboard)
      });
    }

    if (path.endsWith('/metrics')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPharmacyMetrics)
      });
    }

    if (path.endsWith('/financial')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPharmacyFinancial)
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.route('**/api/notifications**', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    })
  );
}
