# Character catalog freshness review

Checked **2026-10-06**. This review owns identity/release facts only. Provider capture in [Character Truth Capture](CHARACTER_TRUTH_CAPTURE.md) remains noncanonical.

| Character | Current reviewed identity/release | Evidence |
| --- | --- | --- |
| Hsin | 5★ Electro / Rectifier; RELEASED in Version 3.7 | [Kuro 3.7 patch notes, September 30](https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5562) identify 心 (Hsin), 導電 (Electro), 音感儀 (Rectifier). [Kuro phase-I Convene, September 29](https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5528) makes Hsin obtainable from the 3.7 update through October 22. |
| Jingran | 5★ Fusion / Broadblade; RELEASED in Version 3.6 | [Kuro 3.6 patch notes, August 20](https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5340) identify 景燃 (Jingran), 熱熔 (Fusion), 長刃 (Broadblade). [Phase-II live report, September 11](https://www.theouterhaven.net/wuthering-waves-version-3-6-update-lamplight-in-mirage-swords-resolve-in-heart-part-two-is-live/) confirms the second half is live and introduces Jingran. A completed debut Convene does not revert a released identity to upcoming. |
| Suoming | 5★ Electro / Sword; CONFIRMED_UPCOMING | Kuro's same 3.7 notes identify 鎖暝 (Suoming), 導電 (Electro), 迅刀 (Sword), and the distinct phase-II Convene. Kuro's current phase-I notice features Hsin. [Current banner schedule](https://www.wuwabuild.com/banners) places Suoming in upcoming phase II, October 22. This supports the existing upcoming status; the patch-wide content announcement alone does not prove Suoming playable on October 6. |

The Kuro article bodies were reviewed through current web-indexed text; direct HTML opens returned the JavaScript shell. The secondary release/schedule sources corroborate timing and do not supply gameplay values. No PR #236 consensus is used as promotion authority.

## Preserved boundaries and affected consumers

- HP, ATK, DEF and Max Energy remain **null for all three**. Jingran provider DEF 0 and Max Resonance Energy 140 are not imported; Liberation cost does not establish Max Energy. Verification is PARTIALLY_VERIFIED, integration DATA_ONLY.
- Existing released baseCombat defaults apply to Hsin/Jingran automatically. Suoming retains null baseCombat.
- RELEASED-selectable coverage becomes **57 → 59**. Safe DEFAULT Calc Target coverage stays **19 catalog identities**, with **17 → 19 released-selectable**. Source pins, reference values and fallback policy are unchanged.
- Separate pinned Build Stats, Skills and Sequence projections retain their **57 reviewed Characters**. `CHARACTER_PRESENTATION_PENDING` explicitly holds Hsin/Jingran out of these projections; existing UI renders Pending when their projection is absent. Jingran's previously captured asset references do not promote its kit. Hero Art uses explicit source-review Pending entries. No new assets or kit/Sequence values are imported.
- Raw pending exceptions and mechanics source blockers explicitly account for the newly released identities. Their intrinsic audit still reports missing profiles, and DPS preflight remains blocked. Existing Character readiness dispositions, freeze approvals and evaluator behavior are unchanged; no new DPS readiness is granted.
- Character database/browser exports and generated coverage/reconciliation reports reflect catalog availability. Provider capture, fact counts, consensus and conflict counts are unchanged. Four formerly provider-only identity facts now agree with reviewed canonical identity; the report remains evidence-only.
- Historical Weapon effect impact reviews retain their original reviewed roster. Current roster tests explicitly keep Hsin/Jingran outside those earlier reviews rather than claiming a retrospective review.

Suoming remains freshness-sensitive until a released-build review. Hsin/Jingran progression and presentation/mechanics require separate source review. Post-merge Handoff history should record the availability/Target coverage change; Buggar has no tracked bug-state change in this workstream.
