Kode for å bygge prosjekt: 
npx expo start --tunnel -c


1. Testing
Jeg har brukt Jest og React Native Testing Library.

Unit test (Opprettelse & Navigasjon): Tester at et gyldig notat blir opprettet og at brukeren navigeres tilbake.
Integration test (Mocking & Loader): Simulerer henting av notat og verifiserer at loader vises under lasting og forsvinner når data er hentet.
Auth guard test: Tester at innhold ikke vises når bruker ikke er logget inn.

Kjør tester:
- npm test


2. Production Readiness & Optimization
 - Log cleanup: Ingen console.log i produksjonskode.
- Kamera: Appen bruker expo-image-picker, og kamera kjører ikke i bakgrunnen.

- Pagination:
    - Henter kun 5 notater om gangen med .range()
    - "Last mer"-knapp henter neste 5 notater

3. Build & Dokumentasjon
- App-fil: Link til APK er i pdf  og fungerer på mobil.

 - Byggeinstruks:
    - npm install -g eas-cli
    - eas login
    - eas build -p android --profile preview