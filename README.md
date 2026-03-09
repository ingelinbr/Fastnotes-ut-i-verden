Cloud Note:
Cloud Note er en mobilapplikasjon utviklet med React Native (Expo) og Supabase.
Applikasjonen lar brukere opprette konto, logge inn og administrere notater som lagres i en skybasert database.

Appen bruker Supabase for autentisering og database, og implementerer et komplett CRUD-system for notater.

Funksjonalitet
- Autentisering
    Brukere kan opprette konto med e-post og passord.

    Brukere må logge inn før de får tilgang til appen.

    Brukere kan logge ut.

    Supabase håndterer sikker lagring av credentials og session.

    E-postbekreftelse er implementert med en tilpasset email template i Supabase.


Notathåndtering

Appen implementerer et komplett     CRUD-system:
- Create
    Brukeren kan opprette et nytt notat med:
    - Tittel
    - Tekst
    - Notatet lagres i databasen med:
    - Bruker som opprettet notatet
    - Tidspunkt for siste endring

- Read
    Alle notater vises på hovedskjermen "Jobb Notater".
    For hvert notat vises:
    - Tittel
    - Innhold
    - Hvilken bruker som opprettet notatet
    - Tidspunkt for siste oppdatering

- Update
    Brukere kan redigere eksisterende notater.
    Når et notat oppdateres lagres et nytt updated_at tidspunkt.

- Delete
    Brukere kan slette notater. Før sletting må brukeren bekrefte handlingen.


Database

Tabellen notes inneholder følgende felter:

Felt	    Beskrivelse
id	        unik ID for notatet
title	    tittel på notatet
content	    tekstinnhold
user_id	    ID til brukeren som opprettet notatet
user_email	e-post til brukeren
created_at	tidspunkt notatet ble opprettet
updated_at	tidspunkt notatet sist ble endret


Supabase Setup
Prosjektet krever et Supabase-prosjekt.

Miljøvariabler lagres i .env:
    EXPO_PUBLIC_SUPABASE_URL=your_project_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key