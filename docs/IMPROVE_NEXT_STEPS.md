# Improve: riktning och kvarvarande arbete

## Etappstatus 2026-11-11

- Etapp 1 finns bevarad separat. Browserregressionen med DPS-optimering avstängd har körts om och passerat: statråd och DPS-jämförelse är separata, och kontot ändras först vid Equip.
- Etapp 2 är ansluten till den lokala Improve-tjänsten. Fem slots jämförs mot samma Current och mål, med övriga fyra Echoes oförändrade. Slotbyte återanvänder den färdiga analysen.
- Hela Chisa-analysen har tidsmätts, inte bara enskilda DPS-anrop. Ett separat browserkonto har också kontrollerat fem kostnadsresultat och återanvändning vid slotbyte. Ägarens konto har inte använts.
- Samtliga fem placeringar är nu fastställda i det kontrollerade Chisa-fallet och kostnaderna har kontrollerats med en separat simulering. Osäkra resultat i andra fall ska fortfarande anges som osäkra, utan påhittade ranknummer.
- Den breda privata verifieringen är inte grön. Den äldre integritetskontrollen är jämförd med sparad utgångsversion; dess manifest har inte skrivits om för att dölja avvikelser. Detaljerad motorevidens och mätresultat hålls i det privata projektet.
- Sex äldre testfel i fixtures och plattformsantaganden är rättade. Kvarvarande äldre avvikelser är klassificerade per test i det privata projektet; de historiska integritetsmanifesten har inte ändrats.
- Ingen merge, publicering eller ändring av den godkända layouten ingår. Fullständig roster-/utrustningstäckning och universellt snabba, precist ordnade femslotsresultat återstår.

## Fortsättning 2026-11-11

- Etapp 1 är bevarad i separata lokala commits i simulatorn och motorrepot. Ingen push, merge eller publicering har gjorts.
- Etapp 2: äldre återupptagbar analys har kontrollerats mot dagens native-modell med Chisa. Slot-/prefixbyte återanvände tidigare slotresultat; ändrad utrustning ogiltigförklarade det gamla jobbet. Det lilla testurvalet verifierar återanvändning, inte rankningens precision.
- Gemensam checkpoint-ekonomi för slotkostnad och Continue/Restart är under utveckling. Avgränsade kontroller mot handräknat exempel och oberoende uttömmande policyjämförelse passerade för samtliga Gates.
- Detta är ännu inte inkopplat i produktens automatiska DPS-rankning. Effektiv native-utvärdering, tillförlitlig sannolikhetsmodell, osäkerhetskontroll och slutlig integration återstår. Ingen ny prestandagaranti eller universell DPS-täckning är verifierad.

## Två etapper: status 2026-11-10

Arbetsgren: `feat/improve-staged-integration-20261110`. Ingen merge eller publicering.

- Etapp 1: statrådgivningen är separerad från DPS-jämförelsen. Hard/Flex, Gate och Continue/Restart styr även när ett färdigt Echo vinner DPS men missar statkraven. DPS-tjänsten behöver inte anropas för att ge statråd.
- Nya ospecificerade inställningar börjar med DPS Optimisation OFF. Sparat uttryckligt val bevaras. Preset-byte aktiverar inte längre DPS-optimering automatiskt.
- Team DPS använder benämningen New Echo. Jämförbara resultat kan markera Current eller New Echo grönt; lika, saknade eller oförenliga resultat ger ingen vinnare. Villkorad DPS behåller ER-markeringen. Gul favoritstatmarkering är oförändrad.
- Förväntade Echoes och EXP följer samma privata statpolicy som Tuners. Tubes visas som Gold-equivalent EXP-referens, inte som en lösning för spelarens ändliga Tube-lager.
- Regression: fokuserade policy-, jämförelse-, konto-, Equip- och klientkontroller har passerat. Ett riktigt Chrome-flöde mot lokala privata tjänster kontrollerade ett isolerat syntetiskt Augusta-konto: DPS Optimisation OFF, fem registrerade rolls, båda vinnarmarkeringarna, förväntade resurser och kontosparande först vid Equip. Detta bevisar inte rosterbred DPS-täckning eller produktionsanslutning.
- Reproducerbart browsertest: `test/improveStageOne.browser.mjs`, med `BELLIBING_LOCAL_ENGINE` och vid behov `BELLIBING_CHROMIUM_PATH`. Utan privat lokal tjänst är testet uttryckligen överhoppat; det får inte räknas som godkänt gränssnittstest.
- Etapp 2 är påbörjad men inte färdig. Val av slot/observerad roll avbryter inte längre samma pågående femslotsjobb. Ett faktiskt övergivet jobb släpper arbetaren. Den gemensamma kostnadspolicyn, förberedd native-DPS och återupptagbar V1-analys återstår. Den äldre automatiska sökningen är därför fortfarande experimentell.
- Ingen full testsvit, privat Worker-smoke eller slutlig releaseverifiering har genomförts i denna etapp.

Uppdaterat 2026-11-10 efter ägarens förtydligande. Fortsättning på PR #365, WIP-bas `df887a67`. Ingen publicering ingår.

## Senaste rättning: jämförbar uppgraderingskostnad

- Rankningen läses från den privata motorns osäkerhetsbedömning: **1 = bästa startval, 5 = dyrast att förbättra** mot samma nästa DPS-steg. Frontend sorterar inte längre ett litet stickprov på egen hand.
- Kostnader med svagt underlag märks `Uncertain`. En olöst konkurrent tappas inte bort ur rankningen. Relativ ordning kan vara styrkt även om den absoluta kostnaden fortfarande har stor osäkerhet.
- Preview-kandidaten skickas separat från de fem utrustade Echo-mallarna. Vald slot, species och observerade rolls ska inte ändra underlaget för de fem utrustade kortens rankning.
- Befintlig native-utvärderare och kostnadsregler återanvänds. Den privata sökningen har fått större, successivt utökade urval och kostnadsgränser. Ingen ny DPS-kalkylator eller layout har lagts till.
- Avgränsad native-kontroll gjord med syntetisk Chisa och de visade substatkombinationerna, inte ägarens sparade konto. Vald slot/prefix bevarade rankningsunderlaget. Sällsynta förbättringar fick ett större urval och osäkra kostnader förblev märkta. Råa motordetaljer och verifieringsunderlag finns endast i det privata repot.
- Prestanda återstår: native-kontrollen tog cirka 6½ minut. Lokal timeout är utökad; tyngre lag kan fortfarande ta för lång tid. Ingen full testsvit eller universell Character-/utrustningstäckning är verifierad.

## Senaste genomgång: ER och hela Improve-flödet

- ER-fältet använde tidigare en benchmarkreferens (120 % för bland annat Chisa). Nya standardförslag läses nu från Character-guidens ER-intervall. Chisa: 125 %+ i den sparade källan. Augusta: ägarens 115–125 %. Manuella numeriska mål, även äldre sparade värden, bevaras. Övre intervallgränsen är ingen gräns som underkänner extra ER. Lagberoende källvillkor bevaras; rotationens faktiska energikrav är en separat kontroll.
- Vid enbart ER-brist kan samma native-körning lämna ett separat `conditionalDps`: planerad rotation under antagandet att energi finns. Vyn visar `Planned DPS *` och en kort märkning. Den ordinarie körningen är fortfarande ER-blockerad; ingen verklig uthållig DPS, reparerad rotation eller säker uppgraderingsvinst påstås. Andra mekanik-/castfel får inte döljas av detta.
- En legal Candidate doldes tidigare när Current var ER-blockerad. Båda kan nu visas. Expected från lyckade ER-reparationer kan visas när modellunderlaget matchar. Ingen grön/röd DPS-differens beräknas mellan en blockerad och en genomförbar rotation.
- Mittendelens långa `Estimate details`, osäkerhetsintervall och dubbla globala rekommendation har tagits bort. Ett stickprov utan träff visar inte längre säkert 0 %. Före rolls visas rekommenderad slot respektive `Roll your new Echo` när den valts. ER-reparation märks `More ER needed`; det är inte ett bevis på vilket Echo som är sämst på DPS.
- Två färdiga men ER-blockerade byggen får inte längre beskedet `Current Echo wins` bara för att kandidaten saknar ett godkänt resultat.
- En färdig kandidat som återställer ER får beskedet `ER restored`, inte `New Echo wins` över ett ER-blockerat Current. ER-reparation och bevisad DPS-vinst är olika resultat.

Browserkontroll: sex isolerade kontofall med Augusta/Iuno/Shorekeeper, Chisa/Yangyang Xuanling/Suisui och en spelarvald Calcharo/Zhezhi/Verina-trio utanför lagkatalogen. Varje trio provades med hög ER och utan ER-substats på vald Character. Gates +5/+10/+15/+20/+25 användes mellan fallen. Kontona förbereddes med syntetiska sparade byggen; varje manuellt byggklick från ett tomt konto har inte testats här. I browsern kontrollerades Build → Improve → markerad slot → fem manuella rolls → Candidate-DPS → Equip → Build. Fysisk Echo-identitet och fem sparade substats stämde vid återkomsten. Inga JavaScript-fel registrerades. Ägarens konto användes inte.

Den första browserrundan upptäckte det dolda Candidate-resultatet vid ER-brist och stoppades där; efter rättningen passerade samtliga sex fall. Fokuserade kontroller omfattar tre riktiga native-ER-fall, klientens villkorade visning, Character-mål, osäkra odds samt sökningens slutbesked. Ingen full testsvit eller universell Character-/utrustningstäckning påstås.

Kvarstår särskilt: extra handlingar och förlängd rotation vid ER-brist; tills dess är planerad DPS ett villkorat jämförelsetal. ER-reparationssökningen använder fortfarande sin begränsade +25-policy, inte optimerade Gate-stopp som bevisad billigaste strategi. Sällsynta förbättringar kan saknas i stickprovet. Ett ER-förslag får inte kallas den sämsta slotten eller en säker DPS-vinst.

## Målet

Bygg och spara en Character, välj kontolag, jämför Echo-uppgraderingar mot hela lagets DPS och se sannolikhet samt förväntad resurskostnad. Funktionerna ska hantera ändrade Characters, Gate och statkrav generellt. Guidepreferenser är vägledning, aldrig ett substitut för spelarens faktiska DPS-jämförelse.

## Rättelser och gemensamma kopplingar

- Kontots sparade exakta trio föredras när en rotationsmodell för den finns. Manuellt lagval har företräde. Saknat underlag i eget lag får inte tyst ersättas med referenslag i uppgraderingssökningen.
- Tillfälligt referenslag är separat och märkt. Automatiskt fallbackval omprövas när kontobyggen blir tillgängliga; uttryckligt användarval bevaras.
- Tomma sekundära Echo-slots kan passera kontofångsten utan påhittad utrustning. Rotationen kan fortfarande kräva en faktisk huvud-Echo-färdighet.
- Tillfälliga upptagen-svar från den lokala motorn hanteras med begränsade återförsök och skydd mot gamla resultat.
- Vapenrubriken i Improve läser sparad nivå/rank för alla Characters, i stället för en gammal Augusta-specifik koppling. Manuellt vapenval i Build använder vyns Lv90. Uttryckligen okända importerade nivåer förblir okända.
- Update jämför materiella build-värden och fysisk utrustningsidentitet. Importbevis, metadata och fältordning ska inte skapa en uppdatering.
- Substat-val öppnas genom klick och stängs efter valt värde. Nästa checkpoint kräver eget klick.
- Build och Improve läser rekommenderade main-stat-alternativ och Sonata Sets från samma granskade guideunderlag för 59 Characters. Build sorterar vapen enligt samma underlag. Alternativ som `CRIT Rate / CRIT DMG` bevaras, liksom villkor, källordning och övriga lagliga val. Underlaget är en sparad ögonblicksbild från 2026-10-11, inte en ny webbinsamling.
- Minimikrav mellan rollsteg behandlas som trösklar. Minst 6,7 % CRIT Rate accepterar 6,9 % och högre; det skapar inte en möjlig 6,7 %-roll. Faktiska observerade rolls måste fortfarande vara giltiga spelvärden.

## Genomfört i den fortsatta lokala utvecklingen

- Fler dokumenterade lag använder gemensamma Character-moduler och en omräknad lagtidslinje. Öppning, byten, resurser och utrustning måste fortfarande vara körbara. Detta är modellskattningar, inte verifierad spel-DPS eller stöd för alla godtyckliga trior.
- En deklarerad Echo-ersättning kan aktivera en Sonata-bonus utan att jämförelsen felaktigt avvisas. Lag, ägare, investeringar och övrig utrustning hålls fasta.
- Stödda vapenranker över R1 använder sina befintliga effekter i modellen.
- Sparade spelarvalda trior kan nu skickas till gemensam sammansättning av Character-moduler även när trion saknas i lagkatalogen. Första lagmedlemmen är modellens Main DPS; detta är ett uttryckligt modellantagande, inte en gemensam guiderekommendation. Moduler, roller, modes, byten och resurser måste fortfarande vara kompatibla.
- Produktens lokala Improve-anrop använder samma native-utvärderare även för tidigare specialhanterade pilotlag. Current, Candidate, Expected vid medelstats och uppgraderingssökningen slipper därmed olika leverantörer för samma konto. Historiska benchmarkanrop behåller sin gamla standard för reproducerbarhet.
- ER-blockerade faktiska byggen får påbörja ER-reparation genom utrustningssökningen innan ett separat Recommended-referensbygge krävs. Detta skapar ingen DPS eller godkänd rotation vid ER-brist och ersätter inte framtida stöd för extra rotationshandlingar.
- Ett isolerat eget testkonto har körts genom Current → tom sekundär slot → DPS-sökning och Expected → fem observerade rolls → jämförelse → explicit Equip. Ägarens konto användes inte.
- Ännu inte equippade Echo- och vapen-previews bevaras lokalt per Character. Switch Character-bekräftelsen behövs därför inte längre. Kontosparande är fortfarande uttryckligt.
- Klick utanför stänger arbetsytan utan att radera previewn. Små val får kort respit när pekaren lämnar dem och behåller tangentbordsfokus. Substats använder samma beteende i Build och Improve.
- Rarity-filter finns mellan element och vapentyp i Add Character. Bildytan i Echo-väljaren har stabiliserats för långa namn.
- Build läser vapennivån från den sparade fysiska utrustningen. Äldre lokala utkast återhämtar endast faktiskt känd nivå för samma vapen. Uttryckligen okända importobservationer fylls inte i.

## Nästa motorarbete

Prioritera gemensamma begränsningar före fler enskilda testlag: spelarens valda trio behöver kunna byggas från Character-moduler, utrustningens effekter behöver delta i samma körning och ER-brist behöver hanteras genom uttryckliga rotationsåtgärder. En ny lyckad testtrio är inte bevis för dessa generella funktioner.

1. Utöka den nu införda sammansatta lagtidslinjen där Character-moduler saknar rätt roll/mode eller kompatibel öppning och överlämning. Spelarvalda trior är inte längre begränsade till lagkatalogens identifierare. Ett lagbyte räknas om genom samma körning, men universell täckning återstår. Färdiga lagreferenser är referenser, inte en permanent gräns.
2. Skilj nödvändiga dataluckor från ännu inte implementerad generell modellering. Redovisa vilket som blockerar beräkningen och erbjud ett uttryckligt modellval där underlaget räcker. Gör inga falska löften om verifierad verklig DPS.
3. Lägg till tydligt definierad mänsklig fördröjning som ett modellantagande. Bestäm först vilka delar av tidslinjen den påverkar; lägg inte godtyckligt på en procent på slutlig DPS. Modellklocka, timestop och väntetid behöver vara konsekventa.
4. Hantera ER-brist med dokumenterade extra handlingar och ändrad rotation där modellen kan det. Räkna om tid, energi, buffs och DPS efter åtgärden. Tills dess får en ER-blockerad rotation inte presenteras som körbar.
5. Behåll samma utvärderare för Current, Candidate, conditional Expected och sökning över alla fem slots. Guideprioritet får inte bestämma vilket Echo som ger billigast faktisk förbättring.
6. Fler vapen, huvud-Echo-färdigheter, Sonata-effekter, Sequences och investeringsnivåer behöver exekverbart stöd. Att kunna visa deras statvärden är inte samma sak som att deras effekter deltar i DPS.
7. Bind rekommendationsvillkor till explicit roll/lag/mode där källan har flera alternativ. Den gemensamma kopplingen bevarar redan villkoren men väljer inte automatiskt rätt rolltolkning åt alla Characters.
8. Produktionsanslutning till privat motor och slutlig kandidatverifiering återstår före publicering. Lokal testning kräver ingen merge till main.

## Ägarens UI- och data-backlog

- Granska övriga väljare mot det nu införda preview-sparandet och stängningsbeteendet. En stängning får aldrig radera arbetet.
- Granska övriga kort mot stabil bildyta och kortgeometri oavsett namnens längd.
- Sortera Characters efter senaste release/patch och fem-/fyrstjärnig prioritet enligt ägarens riktning. Rarity-filter finns; verifierad releasedata behövs fortfarande för kronologisk sortering.
- Utöka vid behov återhämtningen av äldre drafts utan att ändra verkligt okända observationer. Känd fysisk vapennivå är ansluten.
- Använd samma kontokarusell och fokus i Build, Improve, Sandbox och Teams.

## Avgränsad verifiering

### Senaste fortsättningen: källändringar och kontrollstatus

- Kontots Equip och Builds lokala utkast har fått en gemensam avstämning. Ett orört utkast följer kontots nya utrustning. Faktiska osparade ändringar bevaras och får inte tyst skriva över det nya kontobygget. Även äldre draft-format och konfliktens fortlevnad efter omladdning är kontrollerade med fokuserade tester.
- Expected knyts till hela trions byggen, investeringar och kontext. Current/Candidate måste dessutom dela motorunderlag och jämförelseidentitet. Gamla resultat tas bort vid ändrad kontext, även före nästa pollning. Fokuserade klientkontroller har passerat.
- Ombyggnad och privat åtkomst blockerades först. Det då stoppade privata kommandot blev **inte utfört vid det tillfället**. Efter att automatisk granskning åter blev tillgänglig kördes privat statuskontroll, motorändringar, fokuserade kontroller och lokal ombyggnad. Ingen global Git-inställning ändrades för att kringgå ägarskapskontrollen.
- Den ombyggda vyn är nu kontrollerad med isolerade browserkonton. Ett dokumenterat kontolag och en spelarvald trio utanför lagkatalogen passerade Current → Expected/sökning → fem observerade rolls → DPS-jämförelse → Equip → återläsning i Build. Builds draft följde kontots faktiska utrustningsidentitet. Inga JavaScript-fel registrerades. Tillfälliga 429-svar återhämtades; favicon gav 404. Detta bevisar flödet för dessa modeller, inte alla lag eller ägarens konto.
- Fokuserade privata kontroller passerade för elva sammansättningsfall, tio sökfall samt två historiska dispatcher-/benchmarkfall. Offentliga kontroller täcker jämförelseunderlag, sparade drafts, lagfångst och val av källa. Tre äldre assertions om automatiska standardlag uppdaterades för redan införd granskad körbar referens; explicit lagval och källans ursprungliga standard kontrolleras fortfarande. De 22 berörda lag-/kontextkontrollerna passerade.
- Huvudprojektets pågående källändringar bevaras som lokal patch och otrackade källfiler under den ignorerade katalogen `artifacts/work-preservation/`. Privat arbete bevaras separat i privat checkout. Privat motorkod eller kontodata kopieras inte till huvudprojektets säkerhetskopia. Inget har committats, pushats eller återställts.
- Expected-DPS vid medelstats är inte automatiskt samma sak som medel-DPS över alla RNG-utfall. Den befintliga statistiska beteckningen ska bevaras. ER-villkorad Expected och ett separat genomförbart referensbygge återstår där modellen inte kan leverera dem.

Gemensamma rekommendationer kontrollerade mot alla 59 källposter. Faktiska Build-väljare kontrollerade för Augusta, Aemeath och Chisa; desktopbilder vid 1920 och 1440. Ett isolerat sparat Jinhsi/Zhezhi/Verina-konto gav numerisk Current-DPS i Improve utan referenslag. Detta är testbyggen, inte mätningar av ägarens konto. Alla fem Gates kontrollerade i sannolikhetsberäkningen och i Sandbox till +25. Fokuserade konto-, fångst- och klientkontroller användes; ingen full testsvit.

Senaste fokuserade kontroller täcker även omräknad lagtid, setbonus vid Echo-ersättning, stödda vapenranker, fysisk ägaridentitet och äldre vapennivåer. Browserkontroller täcker preview efter omladdning/karaktärsbyte, stängning utan dataförlust, tangentbordsfokus och rarity-filter vid 1920 och 1440. Ingen full testsvit eller publiceringsverifiering har gjorts.

Godtyckliga lag och all utrustning har fortfarande inte universell DPS-täckning. Återstående blockerare omfattar saknade huvud-Echo-färdigheter, otillräckliga rotationsresurser, ej stödda investeringar och vissa referensbyggen som inte klarar sin rotation. Current kan vara beräkningsbar även när ett separat Recommended-referensbygge saknas. Mänsklig fördröjning, dokumenterad rotationsreparation vid ER-brist samt produktionsanslutning återstår också. Målet är inte färdigt.

## Fortsättning 2026-11-10: egna delvis fyllda lag och planerad DPS

- Improve fångar nu en, två eller tre faktiskt sparade Characters ur vald lagkontext. Saknade medlemmar lämnar tomma platser. Ingen låneutrustning läggs i kontot. Nytillkomna sparade partners tas med vid omräkning. Rekommenderat lånelag kräver ett uttryckligt kryss och försvinner ur vyn när det stängs av.
- Solo använder den befintliga modulens handlingar på fältet utan Intro/Outro till sig själv. Augusta behöver extra Basic-handlingar för Forte; deras befintliga resursbidrag, tid och skada ingår i modellen. Detta är en deklarerad modellerad solo-rotation, inte bevis för optimal rotation för alla Characters.
- Både egna kontobyggen och tillfälligt referenslag kan visa **Planned DPS** när ER saknas. Samma planerade rotation används för Current, Candidate och ersättningssökningen. Resultatet märks; en ER-blockerad rotation blir fortfarande inte godkänd som hållbar. ER-bristen sänks inte bort med en godtycklig slutprocent.
- Produktens DPS-sökning kräver inte längre att den valda Echo-slotten ensam reparerar hela lagets ER. Ett relevant Echo kan jämföras även om mer ER behövs någon annanstans. Den äldre strikt ER-reparerande sökningen finns kvar för explicit användning och reproducerbara kontroller.
- Ett delvis fyllt eget lag jämför nästa relativa DPS-förbättring, inte 95 % av ett lånat tremannalags DPS. Om ett matchande referensbygge saknas kan nästa relativa förbättring fortfarande beräknas; detta får inte beskrivas som uppnått Recommended-referensmål.
- Noll framgångar i ett begränsat RNG-urval ger fortfarande inget säkert kostnadsestimat. Inget ändligt genomsnitt eller säker nollchans hittas på för ett mycket sällsynt förbättringsutfall.

### Verifierat för denna fortsättning

- 43 fokuserade offentliga kontroller passerade för fångst, jämförelse, klient, feedback och transport. 23 fokuserade privata kontroller passerade för delvis fyllda lag, solo, sökning och oförändrade fulla referenslag. Ingen full testsvit.
- Isolerat browserkonto: Chisa ensam → lånelag på/av → sparad partner → sparad trio. Tomma platser och numerisk planerad DPS kontrollerade. Därefter fem manuella kandidatrolls → numerisk jämförelse → Equip → samma fysiska Echo tillbaka i Build. Inga JavaScript-fel i den passerande körningen. Ägarens konto berördes inte.
- Browserflödet kördes före den sista utökningen av solo-Forte-förberedelsen och den första renderingen av tomma porträtt. Dessa sista ändringar har fokuserade motorkontroller respektive lokal ombyggnad; hela browserflödet har inte körts om efter dem.
- Solo för Chisa, Augusta och Jinhsi gav numeriska modellresultat i syntetiska kontroller; detta är inte universell täckning av alla Characters, vapen, Sequences eller solo-rotationer. Andra resurskrav än ER kan fortfarande blockera en körning och får inte döljas.
- Ingen mänsklig inmatningsfördröjning, generell energireparerande rotation eller publicering ingår. Planerad DPS vid ER-brist är fortsatt en jämförelsegrund, inte verkligt uppmätt hållbar DPS.
