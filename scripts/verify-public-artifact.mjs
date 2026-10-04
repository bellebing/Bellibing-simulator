import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { PUBLIC_BROWSER_MODULES, FORBIDDEN_PUBLIC_FIELDS } from './public-web-boundary.mjs';

export function artifactFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error('Public symbolic link: ' + entry.name);
    return entry.isDirectory()
    ? artifactFiles(resolve(directory, entry.name)).map(path => entry.name + '/' + path) : [entry.name];
  }).sort();
}
export function verifyPublicArtifact(directory = 'dist') {
  const root = resolve(directory);
  const approved = new Set([...JSON.parse(readFileSync(new URL('./public-web-assets.json', import.meta.url), 'utf8')),
    ...PUBLIC_BROWSER_MODULES.map(name => 'assets/' + name + '.js')]);
  const inventory = artifactFiles(root);
  const present = new Set(inventory);
  for (const path of inventory) {
    if (!approved.has(path)) throw new Error('Unapproved public asset: ' + path);
    if (/\.(?:map|ts|tsx)$/.test(path)) throw new Error('Public source artifact: ' + path);
    if (!/\.(?:js|mjs|json|html)$/.test(path)) continue;
    const text = readFileSync(resolve(root, path), 'utf8');
    if (/sourceMappingURL/.test(text)) throw new Error('Public source-map reference: ' + path);
    for (const field of FORBIDDEN_PUBLIC_FIELDS) {
      if (new RegExp('\\b' + field + '\\b').test(text)) throw new Error('Forbidden public field in ' + path + ': ' + field);
    }
    if (path.endsWith('.html')) {
      for (const match of text.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
        const url = new URL(match[1], 'https://public.invalid/' + path);
        const target = decodeURIComponent(url.pathname.slice(1));
        if (url.origin !== 'https://public.invalid' || !approved.has(target) || !present.has(target)) {
          throw new Error('Unapproved/missing script dependency: ' + path + ' -> ' + match[1]);
        }
      }
    }
    // Validate every static/dynamic module import with the JS parser, including HTML scripts.
    const scriptText = path.endsWith('.html')
      ? [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]).join('\n') : text;
    const source = ts.createSourceFile(path, scriptText, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    function walk(node) {
      const specifier = (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) ? node.moduleSpecifier
        : ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword ? node.arguments[0] : null;
      if (specifier) {
        if (!ts.isStringLiteral(specifier)) throw new Error('Nonliteral public module import: ' + path);
        if (!specifier.text.startsWith('.')) throw new Error('External public module import: ' + path);
        const target = relative(root, resolve(dirname(resolve(root, path)), specifier.text));
        if (!approved.has(target) || !present.has(target)) throw new Error('Unapproved/missing module dependency: ' + path + ' -> ' + target);
      }
      ts.forEachChild(node, walk);
    }
    walk(source);
  }
  for (const path of approved) if (!present.has(path)) throw new Error('Missing approved public asset: ' + path);
  console.log(`Public artifact verified: ${inventory.length} assets; ${PUBLIC_BROWSER_MODULES.length} approved compiled browser modules; no source maps.`);
  return inventory;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) verifyPublicArtifact(process.argv[2]);
