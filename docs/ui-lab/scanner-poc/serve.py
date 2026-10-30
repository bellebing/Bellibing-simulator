#!/usr/bin/env python3
"""Local-only review server. No database, retained uploads or production writes."""
import argparse
import contextlib
import io
import json
import mimetypes
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import scanner

HERE=Path(__file__).resolve().parent
LOCK=threading.Lock()
class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass  # Never log uploaded images, builds or identifiers.
    def send(self,status,payload,mime='application/json'):
        body=json.dumps(payload,allow_nan=False).encode() if mime=='application/json' else payload
        self.send_response(status); self.send_header('Content-Type',mime)
        self.send_header('Content-Length',str(len(body)));self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Content-Security-Policy',"default-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'")
        self.end_headers();self.wfile.write(body)
    def do_GET(self):
        if self.path=='/api/catalog':
            c=scanner.data.CATALOG
            return self.send(200,{k:c[k] for k in ['characters','weapons','echoes','sonataSets','statEditor']})
        path=unquote(urlsplit(self.path).path)
        if path in ['/', '/index.html','/app.js','/style.css']:
            file=HERE/('index.html' if path=='/' else path[1:])
        elif path.startswith('/docs/ui-prototypes/assets/'):
            file=(scanner.data.ROOT/path[1:]).resolve()
            if not file.is_relative_to(scanner.data.ROOT/'docs/ui-prototypes/assets'): return self.send(404,{'error':'Not found.'})
        else: return self.send(404,{'error':'Not found.'})
        if not file.is_file(): return self.send(404,{'error':'Not found.'})
        return self.send(200,file.read_bytes(),mimetypes.guess_type(str(file))[0] or 'application/octet-stream')
    def do_POST(self):
        # Loopback only + same-origin JSON/raw requests. Never allow browser forms/CORS.
        host=self.headers.get('Host','')
        expected=f'127.0.0.1:{self.server.server_port}'
        if host not in [expected,f'localhost:{self.server.server_port}']: return self.send(403,{'error':'Local preview only.'})
        if self.headers.get('Origin') not in [None,'http://'+host]: return self.send(403,{'error':'Same-origin requests only.'})
        try: size=int(self.headers.get('Content-Length','0'))
        except ValueError: return self.send(400,{'error':'Invalid request length.'})
        if not 0<size<=scanner.MAX_BYTES: return self.send(413,{'error':'Choose a file up to 5 MiB.'})
        media=self.headers.get('Content-Type','').split(';')[0]
        if self.path=='/api/scan' and media not in ['image/jpeg','image/png','application/octet-stream']: return self.send(415,{'error':'Use JPEG or PNG.'})
        if self.path=='/api/validate' and media!='application/json': return self.send(415,{'error':'JSON required.'})
        if self.path not in ['/api/scan','/api/validate']: return self.send(404,{'error':'Not found.'})
        self.connection.settimeout(15)
        body=self.rfile.read(size)
        if len(body)!=size: return self.send(400,{'error':'Incomplete upload.'})
        try:
            if self.path=='/api/validate': return self.send(200,{'issues':scanner.validate_draft(json.loads(body))})
            if not LOCK.acquire(blocking=False): return self.send(429,{'error':'A scan is running. Try again after it finishes.'})
            try:
                with contextlib.redirect_stdout(io.StringIO()): result=scanner.scan(body)
            finally: LOCK.release()
            return self.send(200,result)
        except (ValueError,TypeError,KeyError,AttributeError): return self.send(400,{'error':'Unreadable card or invalid review. Use an original English Discord card.'})
        except Exception: return self.send(500,{'error':'Recognition failed. Check local scanner dependencies, then try again.'})

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8765);args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'Bellibing scanner preview: http://127.0.0.1:{args.port}',flush=True)
    server.serve_forever()
