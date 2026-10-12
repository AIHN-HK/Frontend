import path from 'node:path';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { dependencyRule } from './dependency-rule.js';

export function createEslintConfig(root) {
  return [
    { ignores: ['legacy/**', 'design-reference/**', 'node_modules/**', 'dist/**', '.superpowers/**', 'playwright-report/**', 'test-results/**', '_vscode/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    { languageOptions: { globals: { process: 'readonly', console: 'readonly' } } },
    {
      files: ['src/**/*.{ts,tsx}'],
      plugins: { 'react-hooks': hooks, 'react-refresh': refresh, 'import-x': importX, architecture: { rules: { dependencies: dependencyRule } } },
      rules: {
        ...hooks.configs.recommended.rules,
        'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
        'architecture/dependencies': 'error',
        'import-x/no-cycle': ['error', { ignoreExternal: true }],
      },
      settings: {
        'import-x/resolver-next': [createTypeScriptImportResolver({ project: path.join(root, 'tsconfig.app.json') })],
        'import-x/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
        'import-x/extensions': ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
  ];
}
