# Sequence detail source contract

Last reconciled: 2026-09-28

This PR216 continuation adds source-backed presentation content to the existing Sequence hover flyout. It does **not** change the persisted Sequence level model, Set/Remove semantics, connector state, Build Stats, combat/DPS, Weapon, Echo, Forte, team mechanics or Hero Art.

## Immutable text source

Sequence identity/text is snapshot from:

- repository: `DommyMM/wuwabuild`
- commit: `2b57a127b26b062ab58d272cd6735338507de1cd`
- file: `public/Data/Characters.json`
- Git blob: `56c16cbd579651d3b08cf9197f71fc705609f9a8`

This is the same pinned Characters source currently used by the Forte ingest. `data/source/character-sequence-ui.json` keeps the original English name, description template, source params and source icon path for each released Character's S1-S6.

Identity joins are explicit:

1. builder manifest `sourceId` -> provider Character `id`
2. builder manifest `sourceChainId` -> provider `chains[].id`
3. provider chain icon -> the existing manifest-backed Character-specific chain asset

No chain is matched by display name.

Runtime formatting is deliberately narrow: source placeholders are substituted only from that row's source `param[]`, and source markup tags are removed. The wording, punctuation, line breaks and mechanics are otherwise not summarized or rewritten. Missing text/params fail closed to **Pending**.

## Reconciliation with the older asset-manifest pin

The existing chain artwork foundation remains tied to the builder manifest's earlier `wuwabuild` asset pin `5fa70b11f1d84fb644e4dbed47873708da0fe66f`. Fresh reconciliation against the current text pin found all **342/342** released S1-S6 descriptions source-resolved.

Eight title strings differ from the older manifest metadata and are intentionally **not** hidden by rewriting the asset manifest:

- Rover (Electro) S6: `Mind’s Depths in a Casket` -> `Mind's Depths in a Casket`
- Suisui S4: `Autumn Mountains I Chant Together` -> `Autumn Mountains in Choir Sing`
- Yangyang: Xuanling S1: `At the wind's breath, the blossoms wake` -> `At the Wind's Breath, the Blossoms Wake`
- Yangyang: Xuanling S2: `River carries her song away` -> `River Carries Her Song Away`
- Yangyang: Xuanling S3: `My grief follows you into the clouds` -> `My Grief Follows You into the Clouds`
- Yangyang: Xuanling S4: `Across the miles, a letter and my longing` -> `Across the Miles, a Letter and My Longing`
- Yangyang: Xuanling S5: `Take wing. Take wing.` -> `Take Wing. Take Wing.`
- Yangyang: Xuanling S6: `Let the azure keep its light` -> `Let the Azure Keep Its Light`

The Sequence detail runtime uses the current pinned text title by `sourceChainId`; the existing canonical icon mapping stays untouched.

## UI boundary

Hovering S1-S6 remains read-only and opens the existing anchored flyout. The flyout shows Sx, canonical source title, original source description and the existing Character-specific icon. The existing Set/Remove button is still the only commit path, and the existing Bellibing consequence text remains limited to explaining that commit behavior.

Long descriptions scroll **inside** the flyout content area; they do not resize or rearrange the Build layout.
