# Bellibing lokalt på Windows 11

Placera två Git-kloner bredvid varandra, med tillhörande versioner av detta startpaket:

```
Bellibing/
  Bellibing-simulator/
    START_BELLIBING_LOCAL.bat
  Bellibing-engine-private/
```

Installera **Node.js LTS 22.16 eller senare**, inklusive npm, samt **Git for Windows**.
Första hämtningen av låsta källor kräver även **GitHub CLI**, `gh auth login`,
Windows inbyggda `tar.exe` och internet. Privat repositoryåtkomst behövs för kloningen.
Startpaketet ändrar inga grenar, hämtar inte nya projektversioner och publicerar inget.

Dubbelklicka på `START_BELLIBING_LOCAL.bat`. Fönstret kontrollerar verktyg, installerar
saknade npm-beroenden från respektive lockfil och verifierar de låsta källorna.
Därefter byggs webbplatsen och den befintliga privata Workern. Webbläsaren öppnar
Build; samma header leder till Improve och Echo Sandbox.

**Stoppa med Enter eller Ctrl+C i startfönstret.** Att stänga webbläsarfliken stoppar
inte servern. Behåll samma adress/port för att behålla webbläsarens lokala kontodata.
Ett nytt konto är tomt: skapa en Build och använd befintlig Add to Account för Improve.
Sandbox använder hypotetiska byggen och skriver inte om ditt Current.

Vid annan mapp eller upptagen port, öppna Terminal i simulatorns mapp och kör:

```bat
START_BELLIBING_LOCAL.bat --engine-directory "D:\Mina projekt\Bellibing-engine-private" --port 8877
```

`--no-open` startar utan automatisk webbläsaröppning. Fel stannar kvar i fönstret.
Om en gammal låsfil finns efter en krasch återtas den endast när dess process saknas.
En aktiv körning avvisas. Felaktig källcache repareras inte genom att skydd hoppas över;
kontrollera källfelet i fönstret. Ingen global Git-inställning ändras.

## Lokala gränser

- Den vanliga publika `dist` byggs och kontrolleras **utan privat Worker**.
- Den körbara lokala kopian finns endast i privata
  `.simulator-output/browser-beta/local-site/`. Den är Git-ignorerad och innehåller
  `LOCAL_REVIEW_ONLY`, inte ett publiceringsgodkännande.
- Servern lyssnar endast på `127.0.0.1`. Privata källor, källcache, disclosure och
  autentiseringsfiler kopieras inte till webbplatsen. Dela eller ladda inte upp den
  lokala kopian; dess Worker är privat klientkod.
- RNG, kostnadspolicyer och Pending-gränser är oförändrade. Körbara Custom-mål måste
  fortfarande stödjas av motorn. Browser DPS och okvalificerade Expected-värden
  förblir Pending.
- Detta är ett startpaket för egna kloner, inte en publicerad motorrelease. Det gör
  ingen kontointegration, merge eller deployment.
