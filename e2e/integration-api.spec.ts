import { test, expect } from '@playwright/test';

const apiUrl = process.env.E2E_API_URL;

test.describe('Integration API', () => {
  test.skip(!apiUrl, 'Set E2E_API_URL to run integration tests against a live backend');

  test('health endpoint responds', async ({ request }) => {
    const base = apiUrl!.replace(/\/api\/?$/, '');
    const response = await request.get(`${base}/health`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('product list endpoint is reachable', async ({ request }) => {
    const response = await request.get(`${apiUrl}/product/list`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });
});
