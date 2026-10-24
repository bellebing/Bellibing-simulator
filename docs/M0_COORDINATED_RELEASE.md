# Coordinated M0 online-beta release

## Current boundary

The existing HTTP backend review is complete and closed. Do not repeat its
canary, hosted parity or resource workload. This work prepares release; it does
not activate a backend, approve a merge, publish Pages or qualify gameplay DPS.
Private Actions is blocked; no approval can substitute for mandatory FULL.

The ordinary site needs both the #353 client and the #41 server. Current public
main does not contain the client release path. The active source record remains
PENDING_REVIEW, with no endpoint or engine files. Public/private source pins,
rotations, ownership and Experimental/Pending semantics are unchanged.

## Prepared public release inputs

`scripts/sandbox-server-release-plan.json` contains only the proposed HTTPS
endpoint and an unapproved HTTP release candidate, with files=[] and review=null.
It is not consumed by the site build and is not a web artifact. No token, signing
key, private revision mapping or engine code belongs in either public record.

After explicit source-release GO, use:

```sh
node scripts/prepare-server-release.mjs --write --approval owner-go:<approval-reference>
```

This writes source configuration only. It does not contact/deploy a service.
Commit that one promotion BEFORE final candidate verification, then freeze the
actual public/private release heads. Do not verify Pending and promote afterward:
that would change the public release inputs and invalidate exact-head evidence.
The current preparation can be checked without promotion/network access:

```sh
node scripts/prepare-server-release.mjs --check
```

The existing mandatory browser-release test now admits only Pending or an
owner-approved HTTP record with the exact planned endpoint and no engine files.
Its existing FULL entrypoint also includes server-transport and release-readiness
regressions. No FULL Verify or broad UI job body/scheduling is removed or weakened.

## Publication guard and stopped service

The verified main artifact and current-main identity checks remain mandatory.
Before packaging AND immediately before Pages deployment, the pipeline validates
that artifact's release record. For SERVER_RUNTIME_V1 only, it requires a valid
CORS OPTIONS response from the configured guest route. No guest is created, no
capability/admin credential is sent and no compute/admission budget is consumed.
A stopped/expired/misconfigured service blocks active release. Pending releases
require no backend and remain honestly Pending.

OPTIONS proves configuration reachability, not remaining quota, engine parity or
capacity. Actual first-use acceptance is the final ordinary-site check below.
If the service stops after publication, metrics/execution become Pending, export
identity is cleared and Sandbox preflight is retired; SIMULATE must not keep a
stale Ready state. The beta expiry/limit/offline reasons have readable copy.
Existing results are not relabeled as a successful new computation.

## Proposed limited Free beta

The paired private operational profile proposes one window of at most 24 hours
and 512 total guest/compute admissions, including retries and website acceptance.
It reuses the existing two services; only Echo has ingress. Its new persistent
beta allowance is independent of both completed experiments and never resets on
restart, a new guest, redeployment or a new UTC day. No automatic renewal.

Guest issuance is anonymous. Signed one-hour capabilities, exact origin,
approximate 60/minute per-location/IP throttling and the strict shared allowance
bound admitted work; they do not promise availability against distributed abuse.
A caller can consume the common quota. This is a small time/request-limited beta,
not a sustained-capacity or peak-memory claim. Exact deployment/configuration,
shutdown and account-usage conditions belong to the private operational plan.
No paid plan, spending increase or paid-overage permission is proposed.

## One coordinated final verification campaign

| Phase | Required evidence/action | Stop condition |
| --- | --- | --- |
| Inputs | Restore existing private Actions availability; apply approved public record; freeze both heads and current mains | Blocked Actions, missing source-release GO or changed inputs |
| Final candidates | ONE private Foundation FULL (foundation + sandbox-replay + verify conjunction), public Verify FULL and applicable UI Review on those heads | Red/skipped/missing mandatory gate; FAST is not FULL |
| Artifact identity | Public exact-head web/visual artifacts and closed public allowlist; private runtime/config hashes in private CI diagnostics | Hash/head/dirty-tree mismatch; private content in public output |
| Private landing | Explicit #41 merge GO for exact verified head; check private main's mandatory automatic result | Main/head changed, conflict or post-merge failure |
| Backend | Separately approved beta code/profile, fresh server signing key and fixed deadline; activate only when public landing/release is approved and imminent | Wrong bindings, expired window, account/resource failure or missing operator cleanup |
| Public landing | Explicit #353 exact-head merge AND Pages release GO; existing main FULL then verified-artifact pipeline | Failed main FULL, obsolete main, expired artifact or failed runtime guard |
| Ordinary site | Exact live revision; actual Sandbox SIMULATE and Improve Current/Candidate on desktop/mobile | Fake/stale Ready, wrong owner/math, quota/resource error or account mutation |

After Actions is available and both final heads are frozen, transition each PR
to Ready once to trigger its existing final jobs. Do not also dispatch FULL or
add the full-verification label for the same head. Keep a successful Ready head
Ready while waiting for merge GO; no verification-only status toggling.

The automatic private/public main runs are required consequences of landing.
They are part of this campaign, not optional duplicate runs to suppress. Keep
successful unchanged evidence; do not dispatch additional ad-hoc FULL, Windows,
roster/native benchmarks or hosted-core reruns. Fix a real failure first and
repeat only invalidated gates. If a readiness check alone fails, do not rerun
all math to fix an operational endpoint. Artifacts must still be valid/current.

Public runners never fetch private source or private artifacts. Existing local
and hosted RNG/auth/retry/isolation evidence is reused. The new website check
covers the remaining boundary: actual Pages origin, HTTP transport, five-card
Sandbox run/export, Reference/Simulated/Change, saved Current, observed Candidate,
equipment/team/owner invalidation, actual latency and unchanged account bytes.
Also exercise stopped/expired/quota Pending behavior and retained Experimental
labels. Do not run a new 59-character or private backend benchmark workload.

## Minimal approvals, with actual heads filled in when eligible

1. Source-release promotion and the bounded backend-beta scope above. This may
   authorize configuration preparation now; backend activation is conditional on
   successful gates and imminent approved Pages release. No clock starts early.
2. After green final evidence: explicit merge GO for private #41 at its frozen
   head, and public #353 at its frozen head WITH Pages release GO. The two PRs may
   be named in one approval message, but neither approval follows from the other.

Do not request landing against today's Pending configuration or promise a live
site while private FULL is blocked. No new plan/payment permission is needed or
requested. If the existing account cannot run its required gates, remain stopped.
