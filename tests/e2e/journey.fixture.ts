import type { Page } from '@playwright/test';
import { resultFixture } from './result.fixture.ts';
export async function studentDefaultFixture(page: Page) {
  await resultFixture(page);
}
export async function studentDarkFixture(page: Page) {
  await resultFixture(page);
  await page.addInitScript(() =>
    localStorage.setItem(
      'aihn.appearance.v1',
      JSON.stringify({ version: 1, preset: 'dark', accent: 'teal', background: 'flat', sidebar: 'light' }),
    ),
  );
}
