# Bellibing lokalt i Windows

Engångsinstallation efter godkännande: kör `scripts/install-windows-local.ps1`
med Windows PowerShell som vanlig användare. Genvägarna sparas i den aktuella
användarens Start-meny. Node.js och projektets npm-paket måste vara installerade.

Öppna **Start**, sök **Bellibing Simulator – Local** och klicka på genvägen.
Webbläsaren öppnas automatiskt på **http://127.0.0.1:8765/build/** när bygget är
klart. Projektmappen måste ligga kvar på samma plats; kör installationen igen om
den flyttas. En andra start återanvänder samma server.

Startaren återanvänder `npm run build` och `preview-simulator-v1.mjs` för den
integrerade applikationen. Ett oförändrat, tidigare lyckat lokalt bygge återanvänds.
Ändringar i källkod, webb, data, assets och byggskript byggs om automatiskt.
Öppna lokala sidor laddas om efter ett lyckat bygge. Vid byggfel behålls senaste
fungerande version och ett Windows-felmeddelande visas. Loggar finns i
`artifacts/windows-local/start-*.log`. Omladdning kan avbryta osparad redigering;
sparade kontodata raderas eller återställs aldrig av startaren.

Stoppa genom **Start → Bellibing Simulator – Stoppa lokal server**, eller
dubbelklicka på `STOP_BELLIBING_LOCAL.cmd` i projektmappen. Att stänga webbläsaren
stoppar inte servern. Ingen automatisk start vid Windows-inloggning installeras.

Den befintliga OCR-startaren `node scripts/start-character-import.mjs` är kvar
med sina befintliga beroenden. Stoppa den här servern först eftersom båda normalt
använder port 8765. Den vanliga Windows-startaren aktiverar inte scanner eller
privat beräkningsmotor. Befintliga Pending-begränsningar gäller fortfarande.
Webbläsarlagring hör till ursprung och profil: använd samma webbläsarprofil och
adressen ovan för samma lokala konto. Data från GitHack flyttas inte automatiskt.
