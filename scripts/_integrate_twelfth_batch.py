from pathlib import Path
import base64, zlib

ROOT = Path(__file__).resolve().parents[1]
CHUNKS = [ROOT / '.tmp' / f'twelfth_integrator_{index}.b64' for index in range(4)]
payload = ''.join(path.read_text(encoding='utf-8') for path in CHUNKS)
source = zlib.decompress(base64.b64decode(payload)).decode('utf-8')
exec(compile(source, __file__, 'exec'))
for path in CHUNKS:
    if path.exists():
        path.unlink()
