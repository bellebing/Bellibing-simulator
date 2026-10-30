#!/usr/bin/env bash
set -euo pipefail
scanner_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
python3 -m venv "$scanner_dir/.venv"
"$scanner_dir/.venv/bin/python" -m pip install -r "$scanner_dir/requirements.txt"
mkdir -p "$scanner_dir/tessdata"
curl -fsSL 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/9ddc24e750eec0994223a9edc3fcb434a2244f3b/eng.traineddata' -o "$scanner_dir/tessdata/eng.traineddata"
printf '8280aed0782fe27257a68ea10fe7ef324ca0f8d85bd2fd145d1c2b560bcb66ba  %s\n' "$scanner_dir/tessdata/eng.traineddata" | sha256sum -c -
printf 'Ready. See README.md for the local preview command. Tesseract CLI and Node 22.16+ must be installed.\n'
