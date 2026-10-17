# Echo Workspace UX review backlog — Sonata, defaults och statval

**Status: DISCOVERY / PROPOSED, not implemented or owner-accepted.** Dokumenterat 2026-10-17 efter produktägarens UI-genomgång. Detta är en *docs-only* arbetsplan. Inga ändrade produktregler, inga nya Wuthering Waves-fakta, inga UI-ändringar eller merges auktoriseras av detta dokument.

## Aktuell evidens och avgränsning

- Public `main` vid genomgång: `259f4881271b5cc84cec5bf2e7f085e6a106a8e3`. Relevant **omergerad** UI Lab-kandidat är [Draft #309](https://github.com/bellebing/Bellibing-simulator/pull/309) (`0d0c959654043c0c40fb66a30e8881194c6070d5`), ovanpå [#308](https://github.com/bellebing/Bellibing-simulator/pull/308) och [#303](https://github.com/bellebing/Bellibing-simulator/pull/303). Det är inte public production.
- `docs/ui-lab/v1.1/index.html` visar en **Sonata Sets**-sektion i vänster `Improve Settings`. `modules/sonata-selection.js` ändrar en Character-lokal `sonataPool`, och `app.js` uppdaterar settings-revision. `modules/simulation-configuration.js` serialiserar `sonataPool` i UI Lab-settings.
- `modules/workshop-editor.js` öppnar däremot befintligt `docs/ui-prototypes/v34-functional.html` med `sourceSetIds` från `defaultRecommendation` **plus slotens redan valda Sonata**, inte från `sonataPool` i vänsterpanelen. Alltså styr de två väljarytorna inte konsekvent samma filter eller samma val. Workshop har redan egen Sonata-filtermeny och per-Echo `selectedSonataSetId`.
- #309 introducerar source-bound per-Character templates; **1/59 komplett, 50 partiella, 8 tomma**. Förvalt `echoId`/`cost`/`mainStatName`/`selectedSonataSetId` existerar där template är fullständig; alternativa eller source-blockerade Main-val förblir Pending.
- Befintliga `v34-functional.html` använder små `.bb-combobox-listbox` (ca 170 px maxhöjd) för Main Stat och för varje Substat-namn/-värde. `renderEditor` gör redan 5 rader; använda Substat-namn görs **disabled** i andra rader. `src/echoStatEditor.ts` verifierar att fem Rank-5 Substat-rolls inte får dubbla namn och att värden/level är canonical. Template-konfigurationen i Fas 6A tillåter *inte* inmatade rolls: observerade Substats tillhör Build/owned-Echo editing, inte framtida privata simulatorresultat.
- Produktkontrakt: `docs/UI_UX_STATUS.md`, `docs/UI_LAYOUT_MOTION_CONTRACT.md`, `docs/DEVELOPMENT_PROCESS.md`; privat projektledarhandoff Draft #19. Inga nya regelsystem eller källöverskrivningar.

## Förslag 1 — en enda huvudingång för Sonata-val (P1, produktägaren granskar)

**Rekommendation:** Ta bort den stora separata Sonata Sets-väljaren från *UI Labs vänstra Improve Settings* och låt `Edit Echo → Echo Workshop` vara platsen där användaren hittar/filterar Sonata Sets och gör en kanonisk tilldelning för en specifik Echo-slot.

Detta tar bort en synligt dubbel väg som i #309 inte ens driver samma state. **Ta inte bort Sonata-identiteter, tidigare User selections, Sonata Effects, set-komposition eller de funktioner som behövs i riktig Build/Echo Workspace.** Detta är en föreslagen förändring av *placering/ansvar* i UI Lab, inte av spelmekanik.

Workshop ska erbjuda:
1. En tydlig, liten förvald filtergrupp **Recommended / Chosen** för vald Character och relevant source-/build-/mode-kontext: exempelvis Augusta `Crown of Valor` och `Void Thunder` när faktiskt vald profil stöder dem. Visa dessa direkt vid öppning.
2. En lättillgänglig **All Sonata Sets / More Sets**-väg så andra giltiga Echoes fortfarande kan väljas. Filter begränsar browserresultat, inte canonical tilldelningsrätt eller användarens `Custom`-val.
3. Ett separat och tydligt val av `selectedSonataSetId` på previewat Echo, som sparas **endast vid Use Echo/Equip Echo** enligt respektive owner. Browserfilter är *inte* ett tyst byte av slotens Sonata.
4. Sparad manuell Sonata, set-kombination och slotkonfiguration ska få företräde när Workshop öppnas på nytt. Källrekommendation och user-val skall märkas olika; en manuellt vald Sonata får inte märkas source-recommended.

**Kontraktsmigrering att utreda före implementation:** inventera alla konsumenter av `sonataPool`, `settingsSnapshot().sonataPool`, settings-/configuration-revision och demo-fixtures. Avskaffa eller deprecera *visuell redundans* utan att tappa existerande Character-val eller bryta den versionerade config-snapshoten. Inga stilla datamigrationer, ingen ändring i real account/Build, ingen private engine-koppling i detta UX-uppdrag. Vid behov uppdateras schema/version med riktiga tester.

**Öppet UI-beslut:** Bekräfta på fungerande 1440 px-skärmbild om vänster Sonata-sektion ska tas bort helt eller ersättas av en kompakt *read-only* `Current sets`-sammanfattning. Rekommenderat förstaval: ta bort väljaren och behåll relevant set-sammanfattning i Echo/Loadout-korten där den redan hör hemma.

## Förslag 2 — Edit Echo öppnar i rätt Character/slot-förval (P1)

När någon öppnar `Edit Echo` skall befintlig slotkonfiguration styra initial visning, aldrig en generell Augusta-fixture:

- **Sparad giltig template:** rätt Echo markerat/previewat, samma Main Stat och Sonata, Cost-matchande browserfilter; inga oavsiktliga commit-ändringar.
- **Tom slot men source-bound slotrekommendation:** föreslå canonical Cost och tillåtna/rankade Main Stats enligt befintlig source/loadout-projektion. Filtrera först på vald relevant Sonata. Visa explicita alternativa Main Stats (t.ex. `CRIT Rate / CRIT DMG`) som *val som användaren behöver göra*, inte som påhittad implicit preferens.
- **Character eller mode saknar verifierad rekommendation:** neutral browser/all-sonata och tydligt `Pending` för exakt saknad dimension, utan Augusta-fallback eller låtsad BiS.
- User-override väger tyngre än recommended, men byter inte automatiskt Character, aktiv slot-mask, real owned Build eller `Simulated Current`.
- `Use Echo` ändrar endast `Configured` på exakt vald slot, återger canonical bild/namn/Cost/Main/Sonata direkt som #309, lämnar `Current`/Candidate/Trash orörda och bevarar cancel/ESC och stale-context-skydd.

Detta är en riktad UX-förenkling av **befintlig** Workshop, inte en ny browser eller en full ombyggnad.

## Förslag 3 — expanderbara val i Echo Stats Editor (P2, separat större UX-slice)

Produktägarens önskade interaktion gäller inmatning av **redan observerade** Echo Substats i Build/owned-Echo editing, inte generatorn i `Simulate`.

- Vid klick på checkpointrad `+5 / +10 / +15 / +20 / +25` expanderas raden **in place** (accordion), med namnval och **canonical** värdeval på samma rad; alltså ingen trång flytande scroll-dropdown. Main Stat-väljaren kan använda samma rymligare inline-mönster men har ett enda namnval och härledd värdedisplay.
- Öppnad rad stannar öppen tills **både Substat name och ett source-valid Substat value** är valt. Då kollapsar den och nästa ännu ofärdiga rad expanderas, om tillgänglig. Vid redigering av tidigare checkpoint behålls redan ifyllda senare värden, såvida inte source-validiteten faktiskt kräver en ändring.
- Hover/fokus ger visuell förhandsvisning utan state-commit; musklick/Enter/Space väljer. Escape/Cancel återställer enbart utkast, inte sparat owned-Echo. Tydliga fokuslägen, tangentbordsordning, reduced-motion, inga klipp/scroll-jumps i Workspace.
- De canonical exakta Tier-värdena för valt Substat läses från befintlig `echoStatEditor.ts` / `echoCoreRules.ts`. Detta är **manuell inmatning av verkligt observerade stats**, inte en ny rollgenerator.

### Redan använd Substat → säkert omplaceringsflöde

I dagens editor är samma Substat-namn disabled i andra rader. För att rätta en felplacering utan onödiga klick:

1. Visa redan använda namn **sist** i listan, synligt märkta `Already at +5` etc., inte osynliga eller permanent disabled.
2. Vid val av använd stat på annan checkpoint: förklara konflikt med specifik ursprungsrad och be om explicit bekräftelse.
3. **Om båda raderna har kompletta giltiga namn + värden:** genomför ett atomiskt **swap** av hela Substat-rollparet mellan raderna. Inga dubbla namn och inga värden som separeras från sin egen Substat.
4. **Om mål- eller ursprungsrad är ofullständig:** lämna ett tydligt *ofärdigt utkast* och be användaren fylla luckan innan Save/Equip blir tillgängligt. Välj **inte** en slumpmässig eller uppfunnen defaultstat. Utvärdera en separat, explicit `Move`-kontroll om swap inte är begripligt.
5. Undo/Cancel under samma editoröppning skall återställa föregående giltiga inmatning; slutlig commit måste fortfarande passera canonical duplicate-/value-/level-validering.

**Före implementation:** granska tillsammans med produktägaren exakt animation, expanderingshöjd och swap/Move-beteende i en *separat* klickbar UI-concept-review. Lös inte detta genom att ändra canonical uniqueness-regeln. En roll på +10 som visas före +5 har ingen påhittad fullständig checkpoint-historik.

## Prioritering, beroenden och acceptans

| Ordning | Slice | Minimikrav / beslutsgate |
| --- | --- | --- |
| P1-A | Sonata single-owner | Produktägaren väljer bort vänster väljare eller read-only summary. Visa vilka state-konsumenter som påverkas; **ingen** backend-/Build-semantik förändras. |
| P1-B | Slot-aware Workshop defaults | Tydlig Cost/Main/Sonata/Echo-prefill för Augusta och en partiell Character; source-provenance och Custom override synliga. |
| P2 | Inline accordion + duplicate correction | Separat designacceptans, därefter riktade Build-editor-tester och browser-interaktion. |
| Later | Real simulator & all-Character coverage | Hanteras i separata Fas 6B-/source-coverage-arbetsströmmar, **inte** av denna PR. |

**Acceptans för framtida implementation:** actual mouse och keyboard/Escape/Tab, hover-preview vs commit, två Characters, full/partial/missing source, alla fem slots, Cost 4/3/1, korrekt Main/Sonata/filter, user override, återöppning och Cancel, revision/stale context, Character switch, Reset, unchanged real account/Current, no fabricated rolls. Desktop Chromium 1440×900 först, därefter 1920×1080 och 2560×1440. För Build-editor: fem checkpoint-rader, fullständiga/incomplete val, canonical tier, duplicate name→confirmation→swap, undo och rejected invalid final card; fokus och layout utan överlapp.

**Stoppsignal:** Detta dokument godkänner **inte** att editorn byggs om, borttagning av `sonataPool` från produktschema, ändrad source-default-policy, en ny privat endpoint eller merge/deploy. Efter ägarens visuell/produktmässiga review beställs en separat liten Codex-uppgift per slice. Ingen funktion får markeras FIXED utan riktig UI-verifiering.
