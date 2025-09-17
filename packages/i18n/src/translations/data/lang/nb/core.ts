/**
 * Grunnleggende norske oversettelser for Reynard-rammeverket
 */
export const coreTranslations = {
  // Tilkoblings- og API-feil
  connection: {
    failed: "Tilkobling mislyktes",
  },

  network: {
    error: "Nettverksfeil",
  },

  request: {
    aborted: "Forespørsel avbrutt",
  },

  // Autentisering og sikkerhet
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer testnøkkel",
    "new-key": "Bearer ny nøkkel",
  },

  // Varsler
  notifications: {
    title: "Varsler",
    dismiss: "Avvis",
    dismissAll: "Avvis alle",
    markAsRead: "Merk som lest",
    markAllAsRead: "Merk alle som lest",
    noNotifications: "Ingen varsler",
    error: "Feil",
    success: "Suksess",
    warning: "Advarsel",
    info: "Informasjon",
    test: "Testvarsel",
    "test-1": "Testvarsel 1",
    "test-2": "Testvarsel 2",
    first: "Første varsel",
    second: "Andre varsel",
    message: "Testmelding",
    "default-message": "Standardmelding",
    "first-message": "Første melding",
    "second-message": "Andre melding",
    "auto-dismiss": "Automatisk avvisning",
    "error-message": "Feilmelding",
    "no-group-message": "Melding uten gruppe",
    "upload-progress": "Opplastingsfremgang",
    "progress-test": "Fremgangstest",
    "progress-test-2": "Fremgangstest 2",
    "custom-duration": "Tilpasset varighet",
    "group-message": "Gruppemelding",
    "regular-message": "Vanlig melding",
    "created-notification": "Opprettet varsel",
    "first-grouped": "Første gruppert",
    "second-grouped": "Andre gruppert",
  },

  // Valideringsmeldinger
  validation: {
    required: "Dette feltet er påkrevd",
    invalid: "Ugyldig verdi",
    tooShort: "Verdien er for kort",
    tooLong: "Verdien er for lang",
    invalidEmail: "Ugyldig e-postadresse",
    invalidUrl: "Ugyldig URL",
    invalidNumber: "Ugyldig nummer",
    minValue: "Verdien er for liten",
    maxValue: "Verdien er for stor",
    "invalid-input-type": "Ugyldig inputtype",
    "does-not-match-pattern": "Input matcher ikke det påkrevde mønsteret",
  },

  // Passordvalidering
  password: {
    "must-be-at-least-8-characters-long": "Passordet må være minst 8 tegn",
    "must-contain-at-least-one-uppercase-letter": "Passordet må inneholde minst én stor bokstav",
    "must-contain-at-least-one-lowercase-letter": "Passordet må inneholde minst én liten bokstav",
    "must-contain-at-least-one-number": "Passordet må inneholde minst ett tall",
    "must-contain-at-least-one-special-character": "Passordet må inneholde minst ett spesialtegn",
  },

  // Sikkerhetsvalidering
  security: {
    "at-least-one-character-type-must-be-included": "Minst én tegnetype må inkluderes",
    "input-contains-potentially-dangerous-html": "Input inneholder potensielt farlig HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Input inneholder potensielt farlige SQL-mønstre",
    "input-contains-potentially-dangerous-xss-patterns": "Input inneholder potensielt farlige XSS-mønstre",
    "input-contains-path-traversal-patterns": "Input inneholder sti-traversering mønstre",
    "input-contains-windows-reserved-names": "Input inneholder Windows-reserverte navn",
    "input-contains-executable-file-extensions": "Input inneholder kjørbare filutvidelser",
    "input-contains-null-bytes": "Input inneholder null-bytes",
    "input-contains-hidden-files": "Input inneholder skjulte filer",
    "input-contains-javascript-file-extensions": "Input inneholder JavaScript-filutvidelser",
  },

  // Asynkrone operasjoner
  async: {
    "operation-timed-out": "Operasjonen tidsavbrutt",
    "custom-timeout": "Tilpasset timeout",
    "original-error": "Opprinnelig feil",
    "first-failure": "Første feil",
    "second-failure": "Andre feil",
    "persistent-failure": "Vedvarende feil",
    "function-failed": "Funksjonen mislyktes",
    "mapper-failed": "Mapper mislyktes",
    "concurrency-must-be-greater-than-0": "Samtidighet må være større enn 0",
    "polling-timeout-reached": "Polling-timeout nådd",
  },

  // Modullasting
  module: {
    "is-null": "Modulen er null",
    "invalid-structure": "Ugyldig modulstruktur",
    "load-failed": "Lasting mislyktes",
    "loading-failed": "Lasting mislyktes",
  },

  // Lagring og serialisering
  storage: {
    "potentially-dangerous-json-detected": "Potensielt farlig JSON oppdaget",
    "failed-to-parse-json-from-localstorage": "Kunne ikke parse JSON fra localStorage:",
    "error-parsing-storage-event": "Feil ved parsing av lagringsbegivenhet for nøkkel",
  },

  // Test og utvikling
  test: {
    error: "Testfeil",
    message: "Testmelding",
    notification: "Testvarsel",
    "notification-1": "Testvarsel 1",
    "notification-2": "Testvarsel 2",
  },

  // Generelle feil
  errors: {
    "string-error": "Strengfeil",
    "crypto-error": "Krypto-feil",
    "some-error": "Noen feil",
  },

  // Formattere og verktøy
  formatters: {
    "hello-world": "Hei verden",
  },

  // Dato og tid
  dateTime: {
    now: "Nå",
    today: "I dag",
    yesterday: "I går",
    tomorrow: "I morgen",
    format: "Format",
    timezone: "Tidssone",
  },

  // Integrasjonstester
  integration: {
    "session-and-api-key-generation": "Sesjon og API-nøkkel generering",
    "authentication-and-input-validation-integration": "Autentisering og inputvalidering integrasjon",
    "performance-and-security-integration": "Ytelse og sikkerhet integrasjon",
  },
};
