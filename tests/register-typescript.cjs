const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(require('fs').readFileSync(file, 'utf8'), {
  compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true},
}).outputText, file);
