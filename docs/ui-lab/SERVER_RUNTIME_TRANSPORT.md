# Private server transport for ordinary simulator routes

The existing Sandbox and Improve clients can use a reviewed `SERVER_RUNTIME_V1`
release record containing an HTTPS `/runtime/v1/` endpoint and `files: []`.
They fetch no private calculator/Worker bytes. The checked-in release approval
remains `PENDING_REVIEW`; no endpoint is activated or deployed by this change.

The public transport carries configuration intent and receives allowlisted
simulation results. It contains no Echo RNG, policy, DPS formulas, private data,
administrative bearer token or signing secret. A server-issued, short-lived guest
capability is held only in memory. It is not the private canary/admin credential.

Existing Current/Candidate/Build/Sandbox ownership stays authoritative. The same
client facade keeps revision, context and generation freshness checks; delayed
responses cannot write back into a different owner. Network retries reuse the
same command identity and expected server revision. Private session expiry,
revision conflict, unsupported source contexts and service failure do not create
zero values or an upgrade verdict. All DPS stays Experimental/Pending as before.

The existing shared Team DPS panel can use the same reviewed service, including
on GitHub Pages; localhost-only review remains compatible for local workflows.
Server-returned source/context/ER checks still gate every actor and Team Total.

Local desktop/mobile verification uses the ordinary built Sandbox/Improve routes
with the private HTTP backend and no private browser-worker staging. Hosted
authentication, provider limits and actual Pages-to-backend acceptance remain
unverified. Private implementation/fixtures/results stay in the private repository.
Changing the release record requires the separately approved public activation;
main merge still triggers the existing verified-artifact Pages pipeline and
therefore needs the separate merge/deployment GO already required by the process.
