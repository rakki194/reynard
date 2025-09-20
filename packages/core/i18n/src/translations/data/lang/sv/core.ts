/**
 * Grundläggande svenska översättningar för Reynard-ramverket
 */
export const coreTranslations = {
  // Anslutnings- och API-fel
  connection: {
    failed: "Anslutning misslyckades",
  },

  network: {
    error: "Nätverksfel",
  },

  request: {
    aborted: "Förfrågan avbruten",
  },

  // Autentisering och säkerhet
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer testnyckel",
    "new-key": "Bearer ny nyckel",
  },

  // Notifieringar
  notifications: {
    title: "Notifieringar",
    dismiss: "Avvisa",
    dismissAll: "Avvisa alla",
    markAsRead: "Markera som läst",
    markAllAsRead: "Markera alla som lästa",
    noNotifications: "Inga notifieringar",
    error: "Fel",
    success: "Framgång",
    warning: "Varning",
    info: "Information",
    test: "Testnotifiering",
    "test-1": "Testnotifiering 1",
    "test-2": "Testnotifiering 2",
    first: "Första notifieringen",
    second: "Andra notifieringen",
    message: "Testmeddelande",
    "default-message": "Standardmeddelande",
    "first-message": "Första meddelandet",
    "second-message": "Andra meddelandet",
    "auto-dismiss": "Automatisk avvisning",
    "error-message": "Felmeddelande",
    "no-group-message": "Meddelande utan grupp",
    "upload-progress": "Uppladdningsframsteg",
    "progress-test": "Framstegstest",
    "progress-test-2": "Framstegstest 2",
    "custom-duration": "Anpassad varaktighet",
    "group-message": "Gruppmeddelande",
    "regular-message": "Vanligt meddelande",
    "created-notification": "Skapad notifiering",
    "first-grouped": "Första grupperade",
    "second-grouped": "Andra grupperade",
  },

  // Valideringsmeddelanden
  validation: {
    required: "Detta fält är obligatoriskt",
    invalid: "Ogiltigt värde",
    tooShort: "Värdet är för kort",
    tooLong: "Värdet är för långt",
    invalidEmail: "Ogiltig e-postadress",
    invalidUrl: "Ogiltig URL",
    invalidNumber: "Ogiltigt nummer",
    minValue: "Värdet är för litet",
    maxValue: "Värdet är för stort",
    "invalid-input-type": "Ogiltig indatatyp",
    "does-not-match-pattern": "Indata matchar inte det nödvändiga mönstret",
  },

  // Lösenordsvalidering
  password: {
    "must-be-at-least-8-characters-long": "Lösenordet måste vara minst 8 tecken",
    "must-contain-at-least-one-uppercase-letter": "Lösenordet måste innehålla minst en stor bokstav",
    "must-contain-at-least-one-lowercase-letter": "Lösenordet måste innehålla minst en liten bokstav",
    "must-contain-at-least-one-number": "Lösenordet måste innehålla minst en siffra",
    "must-contain-at-least-one-special-character": "Lösenordet måste innehålla minst ett specialtecken",
  },

  // Säkerhetsvalidering
  security: {
    "at-least-one-character-type-must-be-included": "Minst en teckentyp måste inkluderas",
    "input-contains-potentially-dangerous-html": "Indata innehåller potentiellt farlig HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Indata innehåller potentiellt farliga SQL-mönster",
    "input-contains-potentially-dangerous-xss-patterns": "Indata innehåller potentiellt farliga XSS-mönster",
    "input-contains-path-traversal-patterns": "Indata innehåller sökvägskorsningsmönster",
    "input-contains-windows-reserved-names": "Indata innehåller Windows-reserverade namn",
    "input-contains-executable-file-extensions": "Indata innehåller körbara filändelser",
    "input-contains-null-bytes": "Indata innehåller null-bytes",
    "input-contains-hidden-files": "Indata innehåller dolda filer",
    "input-contains-javascript-file-extensions": "Indata innehåller JavaScript-filändelser",
  },

  // Asynkrona operationer
  async: {
    "operation-timed-out": "Operationen gick ut på tid",
    "custom-timeout": "Anpassad timeout",
    "original-error": "Ursprungligt fel",
    "first-failure": "Första misslyckandet",
    "second-failure": "Andra misslyckandet",
    "persistent-failure": "Beständigt misslyckande",
    "function-failed": "Funktionen misslyckades",
    "mapper-failed": "Mappern misslyckades",
    "concurrency-must-be-greater-than-0": "Samtidighet måste vara större än 0",
    "polling-timeout-reached": "Polling-timeout nådd",
  },

  // Modulladdning
  module: {
    "is-null": "Modulen är null",
    "invalid-structure": "Ogiltig modulstruktur",
    "load-failed": "Laddning misslyckades",
    "loading-failed": "Laddning misslyckades",
  },

  // Lagring och serialisering
  storage: {
    "potentially-dangerous-json-detected": "Potentiellt farlig JSON upptäckt",
    "failed-to-parse-json-from-localstorage": "Kunde inte parsa JSON från localStorage:",
    "error-parsing-storage-event": "Fel vid parsning av lagringshändelse för nyckel",
  },

  // Test och utveckling
  test: {
    error: "Testfel",
    message: "Testmeddelande",
    notification: "Testnotifiering",
    "notification-1": "Testnotifiering 1",
    "notification-2": "Testnotifiering 2",
  },

  // Allmänna fel
  errors: {
    "string-error": "Strängfel",
    "crypto-error": "Kryptofel",
    "some-error": "Något fel",
  },

  // Formaterare och verktyg
  formatters: {
    "hello-world": "Hej världen",
  },

  // Datum och tid
  dateTime: {
    now: "Nu",
    today: "Idag",
    yesterday: "Igår",
    tomorrow: "Imorgon",
    format: "Format",
    timezone: "Tidszon",
  },

  // Integrationstester
  integration: {
    "session-and-api-key-generation": "Session och API-nyckelgenerering",
    "authentication-and-input-validation-integration": "Autentiserings- och indatavalideringsintegration",
    "performance-and-security-integration": "Prestanda- och säkerhetsintegration",
  },
};
