# Bellibing GitHub Pages deployment

The public repository uses GitHub Actions to publish only compiled `dist/` to:

https://bellebing.github.io/Bellibing-simulator/

## Verification and review artifacts

`Verify` runs FAST for draft pull requests and FULL for ready pull requests and pushes to `main`. The draft/ready lifecycle and PR cancellation behavior remain unchanged. Main FULL remains the backstop; required-status-check enforcement is outside this contract and is not established by a skipped draft `verify` job.

Both lanes use their existing strict build and generated-parity gates. After successful checks, they validate `dist/review-build.json` against the exact checked-out PR head or main SHA, require `workingTreeDirty: false`, and upload `bellibing-web-dist` with seven-day retention. Draft artifacts are review builds, not FULL evidence.

FULL retains all source/provenance/readiness audits, focused and full tests, strict build, source and built real-browser gates, packaging checks and whitespace verification. It uploads its final browser-verified `dist` only after all those steps succeed. Visual evidence remains a separate `bellibing-new-ui-home-visual` artifact. Merge evidence must identify the exact candidate head and successful FULL run; manual Export cannot substitute.

## Automatic main deployment

1. A push to `main` runs FULL `verify`.
2. Only after that job succeeds, `Verify` calls the reusable `Deploy Bellibing Web` workflow. PR runs cannot call the deployment path.
3. The packaging job downloads `bellibing-web-dist` from that same workflow run. No other run, PR artifact or manual Export is looked up. It validates the artifact's exact SHA and clean-build identity before Pages packaging and rejects an obsolete main revision.
4. The existing Pages actions package that `dist` and publish it through the `github-pages` environment. Deployment checks current main again. Pages concurrency serializes/cancels superseded publication jobs.
5. Live verification confirms the published SHA and clean-build identity, then preserves the Alpha, Echo Lab and Roll Assist route checks plus the real-Chrome Roll Assist, Augusta upgrade and Ciaccona owned-build smoke checks. The smoke scripts are checked out at the deployment SHA.

There are no npm installs, audits, tests or new web builds in the deployment path. It publishes the same `dist` that FULL verified. Pages write and OIDC permissions are granted to the reusable-workflow caller and restricted inside it to the deployment job; packaging has Pages read, and smoke has contents read only.

`deploy-pages.yml` has only `workflow_call`; it has no independent push or manual deployment trigger. A failed FULL, missing artifact or identity mismatch blocks publication. Live smoke failure remains a failed deployment validation and does not claim a verified production site.

The browser app uses relative asset paths to support the project subpath. `/ui-preview/` is the merged-main New UI route; the Alpha root remains available separately.

## Manual Export

`Export Bellibing Web Artifact` has only `workflow_dispatch`. It checks out the dispatch SHA, sets up Node, installs dependencies, runs the existing strict build, checks exact revision/clean-build identity and uploads `bellibing-web-dist` for seven days. It does not run the full tests or audit suite and does not deploy.

Use it for an explicitly requested downloadable build. Its success is not FULL, MERGE readiness or deployment evidence. Normal PR/main artifacts come from Verify; no separate automatic Export is required.

## Deployment validation

Before merge, PR CI can prove FAST/FULL behavior, exact-head review artifacts, visual evidence and the unchanged FULL gates. The main-only artifact download, Pages packaging, environment permissions, publication and live revision/route/Chrome checks must be validated on the automatic main run after merge. A PR run cannot prove production deployment.
