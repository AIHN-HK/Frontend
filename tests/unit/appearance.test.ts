import { describe, expect, it } from 'vitest';
import { defaultAppearance, parseAppearance } from '@/shared/appearance/appearance';
describe('device preference schema', () => {
  it.each([null,'{','null','{"version":99}','{"version":1,"preset":"__proto__"}'])('rejects unsupported value %s', raw => expect(parseAppearance(raw)).toEqual(defaultAppearance));
  it('accepts only a complete supported version and ignores unrelated properties', () => expect(parseAppearance(JSON.stringify({ ...defaultAppearance, preset: 'dark', token: 'never copied' }))).toEqual({ ...defaultAppearance, preset: 'dark' }));
});
