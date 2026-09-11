# ETNA preview font source

Temporary **v34 visual-parity** asset only.

- Typeface: ETNA
- Designer: Krisjanis Mezulis
- Official source: https://wildtype.design/product/etna-free-typeface/
- Accepted-v34 webfont mirror used by the prior chat prototype: https://db.onlinewebfonts.com/t/3c1a4128f95e2109303b045eda4bfe8a.woff2
- Local file: `etna-v34-preview.woff2`
- Local byte length: `16004`
- SHA-256: `c1415941c25250df68ac199dd81bd140f2777688a8bc1c57eb822fb17c81c93d`
- File validation: WOFF2 magic `wOF2`; font metadata reads family `Etna`, subfamily `Bold`, version `1.000`, designer/manufacturer `Krisjanis Mezulis`.

The local preview font has also been browser-checked in the isolated v34 UI: Home titles, `What Character?`, Character names and the selected-Character/section heading hierarchy resolve to `Etna` rather than the Inter/system fallback.

This local WOFF2 removes the runtime dependency on the external mirror for the isolated `/ui-preview/` visual checkpoint. It is **not** a claim of production provenance or production license clearance. Before production asset promotion, verify/replace it against the official distributed ETNA file and retain the official license/source material.
