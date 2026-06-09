import { Page } from '@playwright/test';
import { createMockToken, mockProfile } from './marketplace-api';

const vapidPublicKey =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

export const mockPrescription = {
  id: 'rx-e2e-1',
  medicine_id: 1,
  file_url: 'https://example.com/rx.pdf',
  status: 'approved',
  created_at: '2026-06-01T10:00:00.000Z',
  Medicine: { id: 1, name: 'Dipirona 500mg' }
};

export async function setupProfileMocks(page: Page) {
  await page.route('**/api/user/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();

    if (method === 'GET' && path.endsWith('/profile')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProfile)
      });
    }

    if (method === 'PUT' && path.endsWith('/edit')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Profile updated' })
      });
    }

    return route.continue();
  });

  await page.route('**/api/prescriptions**', async (route) => {
    if (route.request().method() === 'GET' && !route.request().url().includes('/pending')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockPrescription])
      });
    }
    return route.continue();
  });

  await page.route('**/api/notifications/**', async (route) => {
    const path = new URL(route.request().url()).pathname;

    if (path.endsWith('/vapid-public-key')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ publicKey: vapidPublicKey })
      });
    }

    if (path.endsWith('/push-subscribe') && route.request().method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Push subscription saved' })
      });
    }

    return route.continue();
  });
}

export async function installPushMocks(page: Page) {
  await page.addInitScript(() => {
    const w = window as Window & {
      Notification?: { requestPermission: () => Promise<string>; permission: string };
    };

    w.Notification = {
      requestPermission: async () => 'granted',
      permission: 'granted'
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: async () => ({
          pushManager: {
            subscribe: async () => ({
              toJSON: () => ({
                endpoint: 'https://push.example.com/sub/e2e',
                keys: { p256dh: 'test-p256dh', auth: 'test-auth' }
              })
            })
          }
        })
      },
      configurable: true
    });
  });
}

export { createMockToken, mockProfile };
