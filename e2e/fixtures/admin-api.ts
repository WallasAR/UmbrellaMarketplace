import { Page } from '@playwright/test';

export const mockAdminStats = {
  users: 42,
  products: 128,
  orders: 56,
  pendingPrescriptions: 3
};

export const mockAdminMetrics = {
  period: '30d',
  checkoutSessions: 120,
  paidSessions: 84,
  conversionRate: 70,
  abandonedCarts: 18,
  totalUsers: 42,
  paidRevenue: 24500,
  activeSubscriptions: 12,
  dailyConversion: [
    { date: '2026-06-01', checkoutSessions: 40, paidSessions: 28, conversionRate: 70 },
    { date: '2026-06-02', checkoutSessions: 45, paidSessions: 32, conversionRate: 71.1 },
    { date: '2026-06-03', checkoutSessions: 35, paidSessions: 24, conversionRate: 68.6 }
  ]
};

export const mockAdminFinancial = {
  period: '30d',
  summary: { grossRevenue: 24500, platformFee: 2450, netRevenue: 22050, orderCount: 84, itemCount: 210 },
  daily: [
    { date: '2026-06-01', revenue: 8200, orders: 28 },
    { date: '2026-06-02', revenue: 9100, orders: 32 },
    { date: '2026-06-03', revenue: 7200, orders: 24 }
  ],
  pharmacies: [
    { pharmacyId: 'ph-1', pharmacyName: 'Farmácia Central', grossRevenue: 12000, platformFee: 1200 },
    { pharmacyId: 'ph-2', pharmacyName: 'Farmácia Norte', grossRevenue: 12500, platformFee: 1250 }
  ]
};

export const mockPendingPharmacy = {
  id: 'pending-pharm-1',
  name: 'Farmácia Nova E2E',
  city: 'São Paulo',
  state: 'SP',
  plan_tier: 'pro',
  owner: { email: 'owner@farmacia.com' }
};

export const mockAdminOrder = {
  sessionId: 'cs_test_e2e_order_001',
  total_price: 89.9,
  order_status: 'processing',
  payment_status: 'paid'
};

export const mockAdminUser = {
  id: 'user-e2e-1',
  name: 'Cliente Teste',
  email: 'cliente@test.com',
  role: 'customer'
};

export function createAdminToken() {
  const payload = Buffer.from(
    JSON.stringify({ id: 'admin-e2e', email: 'admin@e2e.com', role: 'admin' })
  ).toString('base64');

  return `e2e.${payload}.signature`;
}

export async function setupAdminMocks(page: Page) {
  await page.route('**/api/admin/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/.*\/api\/admin/, '/api/admin');
    const method = route.request().method();

    if (path.includes('/audit-logs')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    }

    if (path.includes('/banners') && method === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    }

    if (path.includes('/metrics')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAdminMetrics) });
    }

    if (path.endsWith('/dashboard')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAdminStats) });
    }

    if (path.endsWith('/financial/export')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/csv; charset=utf-8',
        headers: { 'Content-Disposition': 'attachment; filename="plataforma-30d.csv"' },
        body: 'Relatório plataforma,Período,30d\nGMV,24500,Comissões,2450,Pedidos,84\n'
      });
    }

    if (path.endsWith('/financial')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAdminFinancial) });
    }

    if (path.endsWith('/orders')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockAdminOrder]) });
    }

    if (path.endsWith('/users')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockAdminUser]) });
    }

    if (path.includes('/pharmacies/pending')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockPendingPharmacy]) });
    }

    if (method === 'PATCH' && path.includes('/pharmacies/') && path.endsWith('/approve')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Approved' }) });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });

  await page.route('**/api/prescriptions/pending**', async (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  );

  await page.route('**/api/notifications**', async (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  );
}
