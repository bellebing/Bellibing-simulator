# Recoverable v34 asset source

The exact processed v34 parity assets are also stored in the Bellibing ChatGPT Project Library. A future ChatGPT UI-building chat in this Project should search the Library by these exact filenames instead of reconstructing or recompressing them:

- `bellibing-ui-build-character-rover.webp`
- `bellibing-ui-improve-character-augusta.webp`
- `bellibing-ui-build-team.webp`

Current Library refs observed 2026-09-12 (implementation must still verify bytes/hashes after materialization):

- Rover: `file_000000003a8881f59a0d63c55a6e54e3`
- Augusta: `file_00000000e6c481f4901cf93ce5f05f37`
- Team: `file_00000000a96081fabbfe4680c7af0463`

After materializing, verify against `README.md` byte counts and SHA-256 values before copying into the repository. Do not use the old truncated PR #192 binary blobs as source material.

These are temporary prototype/parity assets. Their presence in the Library/repository does not establish production/commercial rights clearance.
