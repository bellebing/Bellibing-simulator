# Bellibing GitHub Pages deployment

The repository is public and GitHub Pages is configured to use GitHub Actions.

Production deployment flow:

1. Changes merge to `main` only after Verify CI passes.
2. `Deploy Bellibing Web` runs on pushes to `main`.
3. The workflow runs the full test suite and strict browser build.
4. Only the compiled `dist/` output is uploaded to GitHub Pages.
5. GitHub Pages publishes the project site for `bellebing/Bellibing-simulator`.

Expected project URL:

`https://bellebing.github.io/Bellibing-simulator/`

The browser app uses relative asset paths so the project subpath is supported.
