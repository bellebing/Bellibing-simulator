# v34 ETNA external parity oracle

Temporary visual-parity source for the accepted Bellibing v34 preview.

Exact stylesheet used by accepted v34:

```html
<link rel="stylesheet"
href="https://db.onlinewebfonts.com/c/3c1a4128f95e2109303b045eda4bfe8a?family=Etna">
```

Exact display-family declaration:

```css
font-family: "Etna", Inter, sans-serif;
```

Use ETNA for Home card titles, `What Character?`, Character names and large headings. This parity correction changes only the font source/fallback declaration; it does not tune font size, weight or letter spacing to compensate for a different face.

The previously committed local preview WOFF2 is removed and must not be treated as the production font source.

After external v34 parity is accepted, the intended local production candidate is **ETNA Free Font by Krišjānis Mežulis / WILDTYPE / OTF**. Do not substitute another font named Etna, an Extended variant or a lookalike. The official local file must be visually compared against this external parity oracle before replacing it.
