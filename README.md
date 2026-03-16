Assignment 3 – Native Functions

Denne oppgaven er en videreutvikling av notat-appen fra Assignment 2.
Målet er å implementere native funksjoner som kamera, bildevalg fra galleri, bildeopplasting til Supabase Storage og notifikasjoner.

Implementerte krav
Kamera-integrasjon
- (5%) Permissions: Appen ber om tillatelse fra operativsystemet til å bruke kamera og enhetens bildegalleri før disse funksjonene brukes.
- (10%) Capture & Pick: Brukeren kan velge mellom å ta et nytt bilde direkte i appen eller velge et eksisterende bilde fra galleriet.
- (5%) Preview: Når et bilde er valgt eller tatt, vises det i en forhåndsvisning i notatvinduet før brukeren lagrer notatet.

Storage & Validering
- (10%) Client-side Validation: Før opplasting kontrollerer appen at bildet er under 15MB og at filformatet er JPG, PNG eller WebP.
- (10%) Supabase Upload: Bildet lastes opp til Supabase Storage i en bucket med unike filnavn for å unngå at filer overskriver hverandre.
- (5%) DB Linking: Etter opplasting lagres URL-en til bildet i notes-tabellen i databasen slik at bildet knyttes til riktig notat.

UI / UX (Bilde & Feedback)
- (10%) Loading States: Når et bilde lastes opp eller et notat lagres, vises en spinner og lagre-knappen deaktiveres midlertidig.
- (10%) Aspect Ratio Handling: Bildene vises sammen med notatene og skaleres riktig slik at de ikke strekkes.
- (10%) Error Messaging: Appen viser tydelige feilmeldinger dersom bildet er for stort, har feil format eller hvis opplastingen feiler.

Notifikasjoner
- (5%) System Permissions: Appen ber om tillatelse fra operativsystemet til å sende notifikasjoner til brukeren.
- (5% av 15%) Trigger Logic – Lokal løsning: Vi har valgt den enkle lokale trigger-løsningen. Når brukeren lagrer et nytt notat og supabase.insert er vellykket, sendes en lokal notifikasjon til samme enhet.
- (5%) Content Injection: Notifikasjonen inneholder tittelen på det nye notatet, for eksempel: “Nytt notat: [Notatets tittel]”.