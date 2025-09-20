/**
 * Grundlæggende danske oversættelser til Reynard framework
 */
export const coreTranslations = {
  // Forbindelses- og API-fejl
  connection: {
    failed: "Forbindelse mislykkedes",
  },

  network: {
    error: "Netværksfejl",
  },

  request: {
    aborted: "Anmodning afbrudt",
  },

  // Autentificering og sikkerhed
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer testnøgle",
    "new-key": "Bearer ny nøgle",
  },

  // Notifikationer
  notifications: {
    title: "Notifikationer",
    dismiss: "Afvis",
    dismissAll: "Afvis alle",
    markAsRead: "Marker som læst",
    markAllAsRead: "Marker alle som læst",
    noNotifications: "Ingen notifikationer",
    error: "Fejl",
    success: "Succes",
    warning: "Advarsel",
    info: "Information",
    test: "Test notifikation",
    "test-1": "Test notifikation 1",
    "test-2": "Test notifikation 2",
    first: "Første notifikation",
    second: "Anden notifikation",
    message: "Test besked",
    "default-message": "Standard besked",
    "first-message": "Første besked",
    "second-message": "Anden besked",
    "auto-dismiss": "Auto afvis",
    "error-message": "Fejl besked",
    "no-group-message": "Ingen gruppe besked",
    "upload-progress": "Upload fremskridt",
    "progress-test": "Fremskridt test",
    "progress-test-2": "Fremskridt test 2",
    "custom-duration": "Brugerdefineret varighed",
    "group-message": "Gruppe besked",
    "regular-message": "Almindelig besked",
    "created-notification": "Oprettet notifikation",
    "first-grouped": "Første grupperet",
    "second-grouped": "Anden grupperet",
  },

  // Valideringsbeskeder
  validation: {
    required: "Dette felt er påkrævet",
    invalid: "Ugyldig værdi",
    tooShort: "Værdi er for kort",
    tooLong: "Værdi er for lang",
    invalidEmail: "Ugyldig e-mail adresse",
    invalidUrl: "Ugyldig URL",
    invalidNumber: "Ugyldigt nummer",
    minValue: "Værdi er for lille",
    maxValue: "Værdi er for stor",
    "invalid-input-type": "Ugyldig input type",
    "does-not-match-pattern": "Input matcher ikke det påkrævede mønster",
  },

  // Adgangskode validering
  password: {
    "must-be-at-least-8-characters-long": "Adgangskode skal være mindst 8 tegn",
    "must-contain-at-least-one-uppercase-letter": "Adgangskode skal indeholde mindst ét stort bogstav",
    "must-contain-at-least-one-lowercase-letter": "Adgangskode skal indeholde mindst ét lille bogstav",
    "must-contain-at-least-one-number": "Adgangskode skal indeholde mindst ét tal",
    "must-contain-at-least-one-special-character": "Adgangskode skal indeholde mindst ét specialtegn",
  },

  // Sikkerhedsvalidering
  security: {
    "at-least-one-character-type-must-be-included": "Mindst én tegn type skal inkluderes",
    "input-contains-potentially-dangerous-html": "Input indeholder potentielt farlig HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Input indeholder potentielt farlige SQL mønstre",
    "input-contains-potentially-dangerous-xss-patterns": "Input indeholder potentielt farlige XSS mønstre",
    "input-contains-path-traversal-patterns": "Input indeholder sti gennemgang mønstre",
    "input-contains-windows-reserved-names": "Input indeholder Windows reserverede navne",
    "input-contains-executable-file-extensions": "Input indeholder eksekverbare fil udvidelser",
    "input-contains-null-bytes": "Input indeholder null bytes",
    "input-contains-hidden-files": "Input indeholder skjulte filer",
    "input-contains-javascript-file-extensions": "Input indeholder JavaScript fil udvidelser",
  },

  // Asynkrone operationer
  async: {
    "operation-timed-out": "Operation timeout",
    "custom-timeout": "Brugerdefineret timeout",
    "original-error": "Oprindelig fejl",
    "first-failure": "Første fejl",
    "second-failure": "Anden fejl",
    "persistent-failure": "Vedvarende fejl",
    "function-failed": "Funktion mislykkedes",
    "mapper-failed": "Mapper mislykkedes",
    "concurrency-must-be-greater-than-0": "Samtidighed skal være større end 0",
    "polling-timeout-reached": "Polling timeout nået",
  },

  // Modul indlæsning
  module: {
    "is-null": "Modul er null",
    "invalid-structure": "Ugyldig modul struktur",
    "load-failed": "Indlæsning mislykkedes",
    "loading-failed": "Indlæsning mislykkedes",
  },

  // Lager og serialisering
  storage: {
    "potentially-dangerous-json-detected": "Potentielt farlig JSON detekteret",
    "failed-to-parse-json-from-localstorage": "Kunne ikke parse JSON fra localStorage:",
    "error-parsing-storage-event": "Fejl ved parsing af lager event for nøgle",
  },

  // Test og udvikling
  test: {
    error: "Test fejl",
    message: "Test besked",
    notification: "Test notifikation",
    "notification-1": "Test notifikation 1",
    "notification-2": "Test notifikation 2",
  },

  // Generelle fejl
  errors: {
    "string-error": "Streng fejl",
    "crypto-error": "Krypto fejl",
    "some-error": "Noget fejl",
  },

  // Formattere og værktøjer
  formatters: {
    "hello-world": "Hej verden",
  },

  // Dato og tid
  dateTime: {
    now: "Nu",
    today: "I dag",
    yesterday: "I går",
    tomorrow: "I morgen",
    format: "Format",
    timezone: "Tidszone",
  },

  // Integrationstests
  integration: {
    "session-and-api-key-generation": "Session og API nøgle generering",
    "authentication-and-input-validation-integration": "Autentificering og input validering integration",
    "performance-and-security-integration": "Ydeevne og sikkerhed integration",
  },
};
