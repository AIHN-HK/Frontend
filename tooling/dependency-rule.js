import path from 'node:path';

// Ownership is path based, so it applies equally to aliases, relative imports and re-exports.
export const dependencyRule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { forbidden: 'Dependency violates ownership: {{from}} → {{to}}. {{reason}}' },
  },
  create(context) {
    const sourceRoot = path.join(context.cwd, 'src');
    const source = path.relative(sourceRoot, context.filename).replaceAll(path.sep, '/');
    const from = source.split('/');
    function check(node) {
      if (typeof node.value !== 'string') return;
      const specifier = node.value;
      const absolute = specifier.startsWith('@/')
        ? path.join(sourceRoot, specifier.slice(2))
        : specifier.startsWith('.') ? path.resolve(path.dirname(context.filename), specifier) : null;
      if (!absolute) return;
      const target = path.relative(sourceRoot, absolute).replaceAll(path.sep, '/').replace(/\.(?:[cm]?[jt]sx?)$/, '');
      const to = target.split('/');
      const paths = target === 'routes/paths';
      let reason;
      if (source === 'routes/paths.ts' && !target.startsWith('../')) {
        reason = 'URL constants must not import the application.';
      } else if (from[0] === 'shared' && to[0] !== 'shared') {
        reason = 'Shared may only depend on shared or external libraries.';
      } else if (from[0] === 'modules') {
        if (['app', 'layouts', 'routes'].includes(to[0]) && !paths) {
          reason = 'A module cannot depend on app, layouts or the route tree.';
        } else if (to[0] === 'modules' && from[1] !== to[1] && ![ `modules/${to[1]}`, `modules/${to[1]}/index` ].includes(target)) {
          reason = 'Use the other root module public index.';
        } else if (target.startsWith('../')) {
          reason = 'Application code cannot import repository tooling or legacy.';
        }
      } else if (from[0] === 'layouts' && ['app', 'modules', 'routes'].includes(to[0]) && !paths) {
        reason = 'Layouts depend on shared UI and pure URL paths.';
      } else if (from[0] === 'routes' && to[0] === 'app') {
        reason = 'Routes cannot import app bootstrap.';
      }
      if (target.startsWith('../') && !reason) reason = 'Application imports must stay inside src.';
      if (reason) context.report({ node, messageId: 'forbidden', data: { from: source, to: target, reason } });
    }
    return {
      ImportDeclaration: node => check(node.source),
      ExportNamedDeclaration: node => { if (node.source) check(node.source); },
      ExportAllDeclaration: node => check(node.source),
      ImportExpression: node => check(node.source),
      TSImportType: node => { if (node.argument?.value !== undefined) check(node.argument); },
    };
  },
};
