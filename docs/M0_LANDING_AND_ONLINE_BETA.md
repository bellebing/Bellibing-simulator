# M0 integration and online beta

M0 reuses the existing experimental 59/59 first-team calculator and ordinary
Build, Current, Candidate and Sandbox owners. Gameplay-qualified coverage remains
0/59. No new engine, rotation, source pin or M1 UI is introduced.

## Dependency closure and landing

The main-based integration candidate contains the public #349 runtime stack.
An ancestry audit against current main includes these open PR heads:

184, 185, 186, 187, 188, 301, 302, 303, 308, 309, 311, 312, 313, 314, 315,
316, 317, 318, 320, 321, 322, 323, 328, 329, 331, 332, 333, 334, 335, 336,
337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 349.

The private companion similarly includes private #40 and its runtime ancestors.
Detailed private closure and compute evidence stay in the private repository.
Public #347 is a separate roadmap proposal; #350 is separate source research;
#351 is parked. Those are not implicitly included by this consolidation.

Before landing, require unchanged current main ancestry, successful exact-head
FULL verification with matching web/visual artifacts and the paired private
Foundation/Worker checks. The existing Windows paired verification covers the
original M0 pair; new integration changes require their own exact-head evidence.
Use a history-preserving merge for the consolidated dependency closure and avoid
then merging the superseded stacked PRs individually. No history rewrite or
branch cleanup is proposed. Draft status remains until the owner decides.

Prepare private main first, then public main, with separate explicit merge GO
for each. A GitHub merge cannot be atomic across repositories: record both heads,
recheck ancestry, verify the first merge before the second, and stop if either
changes. Neither merge activates an unverified backend.

## Existing Pages pipeline

The existing public URL is
<https://bellebing.github.io/Bellibing-simulator/>.
GitHub confirms workflow-based Pages from main with HTTPS enforced.
The current pipeline already deploys successful main FULL output automatically:
it downloads that run's verified artifact, checks clean build/head identity,
rechecks current main before packaging and deploying, then checks the live build.

**Public main merge therefore also initiates external Pages deployment.** Obtain
separate Pages deployment GO before public landing. A merge-only GO does not
authorize this coupled release. Do not bypass FULL or deploy local artifacts.

## Verified local integration versus hosted operation

The existing local review connects actual account Current and detached Candidate,
preserves Build ownership, and computes Sandbox Reference/Simulated/Change. The
source-bound equipment, ER, freshness and investment gates remain. Unsupported
mechanics and Expected/qualified DPS stay Pending. See
[the integration review](DPS_V1_INTEGRATION_REVIEW.md).

A separate private workerd feasibility experiment now reproduces all 59 source
references and 59 captured actual builds through the existing private calculator.
Private local Chromium also exercises the ordinary comparison UI through this
backend. The ordinary Sandbox/Improve server transport is implemented with
ephemeral guest capabilities and private server-owned sessions. Focused local
checks cover retries, isolation, restart/replay, RNG receipts and exports. No
private code or private fixtures are added to public artifacts.

This is not an online service. Pages cannot execute the existing loopback Node
bridge, and private browser-engine publication is not authorized. The production
backend remains disabled. The separately approved private canary has completed
its bounded remote parity/resource experiment and its ingress is now closed.
Detailed evidence remains private. This supports the existing split Durable
Object approach for the next M0 integration step, without establishing sustained
capacity, peak memory or online-beta readiness.

The separate ordinary HTTP hosting review has completed and the backend is
closed. Detailed evidence and limitations remain private. The next product step
is a separately approved client/endpoint release, followed by actual ordinary-site
Sandbox SIMULATE and Improve Current/Candidate verification. Required final gates
and Pages release/merge approvals still apply; private Actions remains blocked.
This backend review does not establish deployed Pages-to-backend acceptance.
Never embed a
private canary bearer token or calculator bundle in the website. Cloudflare
Free cannot be accepted solely from a status endpoint or local wall timing.

## Next product phase

The owner orders work as M0 integration → working online beta → Issue #352.
Build a Character, shared owned Echo Inventory, Character Scanner and fast Echo
editing retain the existing product decisions. They are not part of this M0
consolidation. No new visual concept, Scanner or inventory migration is started.
