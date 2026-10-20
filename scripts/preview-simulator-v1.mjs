// Local static preview only. Never builds, stages, uploads or approves an engine.
import {createServer} from 'node:http';
import {readFile, realpath, stat} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {isInside} from './local-paths.mjs';

export async function startPreview({directory = fileURLToPath(new URL('../dist/', import.meta.url)), port = 8765, reviewHandler = null} = {}) {
  directory = await realpath(resolve(directory));
  if (!Number.isInteger(port) || (port !== 0 && (port < 1024 || port > 65535))) throw Error('Ogiltig lokal port (1024–65535).');
  for (const file of ['index.html', 'build/index.html', 'sandbox/index.html', 'improve/index.html', 'review-build.json']) {
    if (!(await stat(resolve(directory, file))).isFile()) throw Error('En färdig Simulator-build krävs. Kör npm run build först.');
  }
  const types = {'.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.txt':'text/plain; charset=utf-8'};
  const server = createServer(async (req, res) => {
    const actualPort = server.address().port;
    if (![`127.0.0.1:${actualPort}`, `localhost:${actualPort}`].includes(req.headers.host)) { res.writeHead(403).end(); return; }
    if (reviewHandler) {
      try { if (await reviewHandler(req,res,{origin:`http://${req.headers.host}`})) return; }
      catch { res.writeHead(503).end(); return; }
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    try {
      let pathname = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${actualPort}`).pathname);
      if (pathname.includes('\\') || pathname.includes('\0')) { res.writeHead(403).end(); return; }
      if (pathname.endsWith('/')) pathname += 'index.html';
      const file = await realpath(resolve(directory, '.' + pathname));
      if (!isInside(directory, file)) { res.writeHead(403).end(); return; }
      const data = await readFile(file);
      res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((ok, bad) => { server.once('error', bad); server.listen(port, '127.0.0.1', ok); });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2), value = key => { const i = args.indexOf(key); return i < 0 ? undefined : args[i + 1]; };
    if (args.length % 2 || args.some((arg, i) => i % 2 === 0 && !['--directory', '--port'].includes(arg))) throw Error('Använd --directory SÖKVÄG och/eller --port NUMMER.');
    const server = await startPreview({directory: value('--directory'), port: Number(value('--port') ?? 8765)});
    const base = `http://127.0.0.1:${server.address().port}`;
    console.log(`Build: ${base}/build/\nSandbox: ${base}/sandbox/\nImprove: ${base}/improve/\nStoppa med Ctrl+C.`);
  } catch (error) {
    console.error(error.code === 'EADDRINUSE' ? 'Porten används redan. Stäng den gamla servern eller välj --port NUMMER.' : `Preview kunde inte startas: ${error.message}`);
    process.exitCode = 1;
  }
}
