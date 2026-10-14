import type { Page } from '@playwright/test';
import { adminFixture } from './admin.fixture.ts';
export async function studentsFixture(
  page: Page,
  options: { status?: number; gate?: Promise<void>; empty?: boolean } = {},
) {
  await adminFixture(page);
  const rows = Array.from({ length: 25 }, (_, i) => ({
      id: 100 + i,
      fullname: `Học sinh ${100 + i}`,
      email: `student${i}@example.test`,
      phone: null,
      address: null,
      gender: null,
      class: 12,
      yob: '2008-01-01T00:00:00Z',
      createdAt: '2026-10-01T00:00:00Z',
    })),
    calls: string[] = [];
  await page.route(/http:\/\/localhost:3000\/api\/v1\/admin\/students(?:\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    calls.push(url.search);
    const pageNumber = Number(url.searchParams.get('page') ?? 1),
      limit = Number(url.searchParams.get('limit') ?? 20),
      q = url.searchParams.get('q') ?? '',
      filtered = options.empty ? [] : rows.filter((r) => `${r.fullname} ${r.email}`.includes(q));
    if (q === 'slow') await options.gate;
    await route.fulfill({
      status: options.status ?? 200,
      json: {
        status: options.status ?? 200,
        data: {
          items: filtered.slice((pageNumber - 1) * limit, pageNumber * limit),
          page: pageNumber,
          limit,
          total: filtered.length,
        },
      },
    });
  });
  return { calls, rows };
}
