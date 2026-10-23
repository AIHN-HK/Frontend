import { afterEach, describe, expect, it } from 'vitest';
import { ESLint } from 'eslint';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createEslintConfig } from '../../tooling/eslint-config.js';

const fixtures: string[] = [];

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

async function lint(files: Record<string, string>) {
  await mkdir(path.resolve('.superpowers/sdd/00-nen-chung'), { recursive: true });
  const root = await mkdtemp(path.resolve('.superpowers/sdd/00-nen-chung/import-fixture-'));
  fixtures.push(root);
  await writeFile(path.join(root, 'tsconfig.app.json'), JSON.stringify({
    compilerOptions: { baseUrl: '.', paths: { '@/*': ['src/*'] }, moduleResolution: 'bundler', module: 'esnext' },
    include: ['src'],
  }));
  for (const [name, contents] of Object.entries(files)) {
    const file = path.join(root, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, contents);
  }
  const eslint = new ESLint({ cwd: root, overrideConfigFile: true, overrideConfig: createEslintConfig(root) });
  return (await eslint.lintFiles(['src/**/*.ts'])).flatMap(result => result.messages);
}

describe('module ownership enforced by the real ESLint configuration', () => {
  it.each([
    ['shared imports a module through the alias', 'src/shared/api/client.ts', "export { value } from '@/modules/alpha/index'", 'src/modules/alpha/index.ts'],
    ['shared imports router paths', 'src/shared/ui/view.ts', "export { value } from '../../routes/paths'", 'src/routes/paths.ts'],
    ['a root module re-exports another module internal', 'src/modules/alpha/index.ts', "export { value } from '../beta/model/value'", 'src/modules/beta/model/value.ts'],
    ['a root module dynamically imports another module internal', 'src/modules/alpha/index.ts', "export const load = () => import('@/modules/beta/model/value')", 'src/modules/beta/model/value.ts'],
    ['a layout takes a domain dependency', 'src/layouts/view.ts', "export { value } from '@/modules/beta/index'", 'src/modules/beta/index.ts'],
    ['a route imports app bootstrap', 'src/routes/index.ts', "export { value } from '../app/bootstrap'", 'src/app/bootstrap.ts'],
    ['paths constants pull in the route tree', 'src/routes/paths.ts', "export { value } from './index'", 'src/routes/index.ts'],
    ['a module imports a layout', 'src/modules/alpha/index.ts', "export { value } from '../../layouts/view'", 'src/layouts/view.ts'],
  ])('rejects %s', async (_name, importer, code, target) => {
    const messages = await lint({ [importer]: code, [target]: 'export const value = 1;' });
    expect(messages.filter(message => message.ruleId === 'architecture/dependencies')).toHaveLength(1);
  });

  it('rejects runtime cycles between otherwise permitted internal files', async () => {
    const messages = await lint({
      'src/modules/alpha/model/a.ts': "import { b } from './b'; export function a() { return b(); }",
      'src/modules/alpha/model/b.ts': "import { a } from './a'; export function b() { return a(); }",
    });
    expect(messages.some(message => message.ruleId === 'import-x/no-cycle')).toBe(true);
  });

  it('permits own subgroups, public module entries, pure paths and route Page imports', async () => {
    const messages = await lint({
      'src/shared/config/value.ts': 'export const value = 1;',
      'src/routes/paths.ts': 'export const home = "/";',
      'src/modules/beta/index.ts': "export { value } from './model/value';",
      'src/modules/beta/model/value.ts': "export { value } from '@/shared/config/value';",
      'src/modules/alpha/api/value.ts': 'export const value = 1;',
      'src/modules/alpha/list/pages/Page.ts': "export { value } from '../../api/value'; export { home } from '@/routes/paths'; export { value as other } from '@/modules/beta';",
      'src/layouts/view.ts': "export { home } from '@/routes/paths';",
      'src/routes/index.ts': "export const load = () => import('@/modules/alpha/list/pages/Page');",
    });
    expect(messages).toEqual([]);
  });
});
