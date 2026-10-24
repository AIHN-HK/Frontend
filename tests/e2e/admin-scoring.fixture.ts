import type { Page } from '@playwright/test';
import { adminFixture } from './admin.fixture.ts';
export async function scoringFixture(page: Page, options: { status?: number; emptyContent?: boolean } = {}, base = true) {
  if (base) await adminFixture(page);
  let priorities = ['R', 'I', 'A', 'S', 'E', 'C'].map((type, i) => ({ id: i + 1, type, priority: i + 1 }));
  const codes = priorities.map((p) => ({
      id: p.id,
      code: p.type,
      title: `Nhóm ${p.type}`,
      personality: options.emptyContent ? [] : ['Tính cách mẫu'],
      strengths: options.emptyContent ? [] : ['Điểm mạnh mẫu'],
      weaknesses: options.emptyContent ? [] : ['Điểm cần cải thiện'],
      careers: options.emptyContent ? [] : ['Nghề tham khảo'],
    })),
    writes: unknown[] = [];
  await page.route(
    /http:\/\/localhost:3000\/api\/v1\/(priority|admin\/(priorities|topcodes)|topcode)$/,
    async (route) => {
      const r = route.request(),
        path = new URL(r.url()).pathname;
      let data: unknown = path.endsWith('topcodes') ? codes : priorities,
        status = 200;
      if (r.method() === 'PUT') {
        writes.push(r.postDataJSON());
        status = options.status ?? 200;
        if (status === 200) {
          if (path.endsWith('priorities')) {
            priorities = r.postDataJSON().priorities;
            data = priorities;
          } else {
            const input = r.postDataJSON(),
              record = codes.find((c) => c.code === input.code);
            Object.assign(record!, input);
            data = record;
          }
        }
      }
      await route.fulfill({ status, json: { status, data } });
    },
  );
  return writes;
}
