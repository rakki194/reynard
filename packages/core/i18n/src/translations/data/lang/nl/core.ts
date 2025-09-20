/**
 * Basis Nederlandse vertalingen voor Reynard framework
 */
export const coreTranslations = {
  // Verbindings- en API-fouten
  connection: {
    failed: "Verbinding mislukt",
  },

  network: {
    error: "Netwerkfout",
  },

  request: {
    aborted: "Verzoek geannuleerd",
  },

  // Authenticatie en beveiliging
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer test sleutel",
    "new-key": "Bearer nieuwe sleutel",
  },

  // Meldingen
  notifications: {
    title: "Meldingen",
    dismiss: "Verwerp",
    dismissAll: "Verwerp alle",
    markAsRead: "Markeer als gelezen",
    markAllAsRead: "Markeer alle als gelezen",
    noNotifications: "Geen meldingen",
    error: "Fout",
    success: "Succes",
    warning: "Waarschuwing",
    info: "Informatie",
    test: "Test melding",
    "test-1": "Test melding 1",
    "test-2": "Test melding 2",
    first: "Eerste melding",
    second: "Tweede melding",
    message: "Test bericht",
    "default-message": "Standaard bericht",
    "first-message": "Eerste bericht",
    "second-message": "Tweede bericht",
    "auto-dismiss": "Automatisch verwerpen",
    "error-message": "Foutmelding",
    "no-group-message": "Bericht zonder groep",
    "upload-progress": "Upload voortgang",
    "progress-test": "Voortgang test",
    "progress-test-2": "Voortgang test 2",
    "custom-duration": "Aangepaste duur",
    "group-message": "Groep bericht",
    "regular-message": "Gewoon bericht",
    "created-notification": "Aangemaakte melding",
    "first-grouped": "Eerste gegroepeerd",
    "second-grouped": "Tweede gegroepeerd",
  },

  // Validatie berichten
  validation: {
    required: "Dit veld is verplicht",
    invalid: "Ongeldige waarde",
    tooShort: "Waarde is te kort",
    tooLong: "Waarde is te lang",
    invalidEmail: "Ongeldig e-mailadres",
    invalidUrl: "Ongeldige URL",
    invalidNumber: "Ongeldig nummer",
    minValue: "Waarde is te klein",
    maxValue: "Waarde is te groot",
    "invalid-input-type": "Ongeldig invoertype",
    "does-not-match-pattern": "Invoer komt niet overeen met het vereiste patroon",
  },

  // Wachtwoord validatie
  password: {
    "must-be-at-least-8-characters-long": "Wachtwoord moet minstens 8 tekens lang zijn",
    "must-contain-at-least-one-uppercase-letter": "Wachtwoord moet minstens één hoofdletter bevatten",
    "must-contain-at-least-one-lowercase-letter": "Wachtwoord moet minstens één kleine letter bevatten",
    "must-contain-at-least-one-number": "Wachtwoord moet minstens één cijfer bevatten",
    "must-contain-at-least-one-special-character": "Wachtwoord moet minstens één speciaal teken bevatten",
  },

  // Beveiligingsvalidatie
  security: {
    "at-least-one-character-type-must-be-included": "Minstens één tekentype moet worden opgenomen",
    "input-contains-potentially-dangerous-html": "Invoer bevat potentieel gevaarlijke HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Invoer bevat potentieel gevaarlijke SQL-patronen",
    "input-contains-potentially-dangerous-xss-patterns": "Invoer bevat potentieel gevaarlijke XSS-patronen",
    "input-contains-path-traversal-patterns": "Invoer bevat pad-traversal patronen",
    "input-contains-windows-reserved-names": "Invoer bevat Windows-gereserveerde namen",
    "input-contains-executable-file-extensions": "Invoer bevat uitvoerbare bestandsextensies",
    "input-contains-null-bytes": "Invoer bevat null-bytes",
    "input-contains-hidden-files": "Invoer bevat verborgen bestanden",
    "input-contains-javascript-file-extensions": "Invoer bevat JavaScript-bestandsextensies",
  },

  // Asynchrone operaties
  async: {
    "operation-timed-out": "Operatie is verlopen",
    "custom-timeout": "Aangepaste timeout",
    "original-error": "Originele fout",
    "first-failure": "Eerste fout",
    "second-failure": "Tweede fout",
    "persistent-failure": "Aanhoudende fout",
    "function-failed": "Functie mislukt",
    "mapper-failed": "Mapper mislukt",
    "concurrency-must-be-greater-than-0": "Gelijktijdigheid moet groter zijn dan 0",
    "polling-timeout-reached": "Polling timeout bereikt",
  },

  // Module laden
  module: {
    "is-null": "Module is null",
    "invalid-structure": "Ongeldige modulestructuur",
    "load-failed": "Laden mislukt",
    "loading-failed": "Laden mislukt",
  },

  // Opslag en serialisatie
  storage: {
    "potentially-dangerous-json-detected": "Potentieel gevaarlijke JSON gedetecteerd",
    "failed-to-parse-json-from-localstorage": "Kon JSON niet parsen van localStorage:",
    "error-parsing-storage-event": "Fout bij het parsen van opslaggebeurtenis voor sleutel",
  },

  // Test en ontwikkeling
  test: {
    error: "Test fout",
    message: "Test bericht",
    notification: "Test melding",
    "notification-1": "Test melding 1",
    "notification-2": "Test melding 2",
  },

  // Algemene fouten
  errors: {
    "string-error": "String fout",
    "crypto-error": "Crypto fout",
    "some-error": "Een fout",
  },

  // Formatters en utilities
  formatters: {
    "hello-world": "Hallo wereld",
  },

  // Datum en tijd
  dateTime: {
    now: "Nu",
    today: "Vandaag",
    yesterday: "Gisteren",
    tomorrow: "Morgen",
    format: "Formaat",
    timezone: "Tijdzone",
  },

  // Integratietests
  integration: {
    "session-and-api-key-generation": "Sessie en API-sleutel generatie",
    "authentication-and-input-validation-integration": "Authenticatie en invoervalidatie integratie",
    "performance-and-security-integration": "Prestatie en beveiliging integratie",
  },
};
