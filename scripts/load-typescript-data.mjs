import fs from 'node:fs';
import ts from 'typescript';

export const loadTypescriptModule = (filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filePath,
  }).outputText;
  const module = { exports: {} };
  const evaluate = new Function('module', 'exports', output);
  evaluate(module, module.exports);
  return module.exports;
};
