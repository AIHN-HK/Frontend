import path from 'node:path';

const FILE_EXTENSION = /\.(?:[cm]?[jt]sx?)$/;
const APPLICATION_LAYERS = new Set(['app', 'layouts', 'routes']);
const LAYOUT_FORBIDDEN_LAYERS = new Set(['app', 'modules', 'routes']);

function toPosixPath(value) {
  return value.replaceAll(path.sep, '/');
}

function removeFileExtension(value) {
  return value.replace(FILE_EXTENSION, '');
}

function getSourcePath(sourceRoot, filename) {
  return toPosixPath(path.relative(sourceRoot, filename));
}

function resolveInternalImport(sourceRoot, importer, specifier) {
  if (specifier.startsWith('@/')) {
    return path.join(sourceRoot, specifier.slice(2));
  }

  if (specifier.startsWith('.')) {
    return path.resolve(path.dirname(importer), specifier);
  }

  // Packages such as react and axios are outside the application's ownership rules.
  return null;
}

function getTargetPath(sourceRoot, importer, specifier) {
  const absoluteTarget = resolveInternalImport(sourceRoot, importer, specifier);
  if (!absoluteTarget) return null;

  return removeFileExtension(toPosixPath(path.relative(sourceRoot, absoluteTarget)));
}

function isPublicModuleEntry(targetPath, moduleName) {
  return targetPath === `modules/${moduleName}` || targetPath === `modules/${moduleName}/index`;
}

function getViolationReason(sourcePath, targetPath) {
  if (!targetPath) return null;

  const sourceParts = sourcePath.split('/');
  const targetParts = targetPath.split('/');
  const sourceLayer = sourceParts[0];
  const targetLayer = targetParts[0];
  const targetIsOutsideSource = targetPath.startsWith('../');
  const importingPaths = targetPath === 'routes/paths';

  if (sourcePath === 'routes/paths.ts' && !targetIsOutsideSource) {
    return 'URL constants must not import the application.';
  }

  if (sourceLayer === 'shared' && targetLayer !== 'shared') {
    return 'Shared may only depend on shared or external libraries.';
  }

  if (sourceLayer === 'modules') {
    if (APPLICATION_LAYERS.has(targetLayer) && !importingPaths) {
      return 'A module cannot depend on app, layouts or the route tree.';
    }

    const importingAnotherModule = targetLayer === 'modules' && sourceParts[1] !== targetParts[1];
    if (importingAnotherModule && !isPublicModuleEntry(targetPath, targetParts[1])) {
      return 'Use the other root module public index.';
    }

    if (targetIsOutsideSource) {
      return 'Application code cannot import repository tooling or legacy.';
    }
  }

  if (sourceLayer === 'layouts' && LAYOUT_FORBIDDEN_LAYERS.has(targetLayer) && !importingPaths) {
    return 'Layouts depend on shared UI and pure URL paths.';
  }

  if (sourceLayer === 'routes' && targetLayer === 'app') {
    return 'Routes cannot import app bootstrap.';
  }

  if (targetIsOutsideSource) {
    return 'Application imports must stay inside src.';
  }

  return null;
}

export const dependencyRule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      forbidden: 'Dependency violates ownership: {{from}} → {{to}}. {{reason}}',
    },
  },

  create(context) {
    const sourceRoot = path.join(context.cwd, 'src');
    const sourcePath = getSourcePath(sourceRoot, context.filename);

    function checkImport(node) {
      if (typeof node.value !== 'string') return;

      const targetPath = getTargetPath(sourceRoot, context.filename, node.value);
      const reason = getViolationReason(sourcePath, targetPath);
      if (!reason) return;

      context.report({
        node,
        messageId: 'forbidden',
        data: { from: sourcePath, to: targetPath, reason },
      });
    }

    return {
      ImportDeclaration: node => checkImport(node.source),
      ExportNamedDeclaration: node => {
        if (node.source) checkImport(node.source);
      },
      ExportAllDeclaration: node => checkImport(node.source),
      ImportExpression: node => checkImport(node.source),
      TSImportType: node => {
        if (node.argument?.value !== undefined) checkImport(node.argument);
      },
    };
  },
};
