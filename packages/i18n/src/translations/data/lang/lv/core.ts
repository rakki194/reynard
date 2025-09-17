/**
 * Pamata latviešu tulkojumi Reynard sistēmai
 */
export const coreTranslations = {
  // Savienojuma un API kļūdas
  connection: {
    failed: "Savienojums neizdevās",
  },

  network: {
    error: "Tīkla kļūda",
  },

  request: {
    aborted: "Pieprasījums pārtraukts",
  },

  // Autentifikācija un drošība
  bearer: {
    token: "Bearer žetons",
    "test-key": "Bearer testa atslēga",
    "new-key": "Bearer jauna atslēga",
  },

  // Paziņojumi
  notifications: {
    title: "Paziņojumi",
    dismiss: "Noraidīt",
    dismissAll: "Noraidīt visus",
    markAsRead: "Atzīmēt kā izlasītu",
    markAllAsRead: "Atzīmēt visus kā izlasītus",
    noNotifications: "Nav paziņojumu",
    error: "Kļūda",
    success: "Veiksmīgi",
    warning: "Brīdinājums",
    info: "Informācija",
    test: "Testa paziņojums",
    "test-1": "Testa paziņojums 1",
    "test-2": "Testa paziņojums 2",
    first: "Pirmais paziņojums",
    second: "Otrais paziņojums",
    message: "Testa ziņojums",
    "default-message": "Noklusējuma ziņojums",
    "first-message": "Pirmais ziņojums",
    "second-message": "Otrais ziņojums",
    "auto-dismiss": "Automātiska noraidīšana",
    "error-message": "Kļūdas ziņojums",
    "no-group-message": "Ziņojums bez grupas",
    "upload-progress": "Augšupielādes progress",
    "progress-test": "Progresa tests",
    "progress-test-2": "Progresa tests 2",
    "custom-duration": "Pielāgots ilgums",
    "group-message": "Grupas ziņojums",
    "regular-message": "Parasts ziņojums",
    "created-notification": "Izveidots paziņojums",
    "first-grouped": "Pirmais grupēts",
    "second-grouped": "Otrais grupēts",
  },

  // Validācijas ziņojumi
  validation: {
    required: "Šis lauks ir obligāts",
    invalid: "Nederīga vērtība",
    tooShort: "Vērtība ir pārāk īsa",
    tooLong: "Vērtība ir pārāk gara",
    invalidEmail: "Nederīga e-pasta adrese",
    invalidUrl: "Nederīga URL",
    invalidNumber: "Nederīgs numurs",
    minValue: "Vērtība ir pārāk maza",
    maxValue: "Vērtība ir pārāk liela",
    "invalid-input-type": "Nederīgs ievades tips",
    "does-not-match-pattern": "Ievade neatbilst nepieciešamajam modelim",
  },

  // Paroles validācija
  password: {
    "must-be-at-least-8-characters-long": "Parolei jābūt vismaz 8 rakstzīmēm",
    "must-contain-at-least-one-uppercase-letter": "Parolei jāsatur vismaz viens lielais burts",
    "must-contain-at-least-one-lowercase-letter": "Parolei jāsatur vismaz viens mazais burts",
    "must-contain-at-least-one-number": "Parolei jāsatur vismaz viens cipars",
    "must-contain-at-least-one-special-character": "Parolei jāsatur vismaz viens speciāls rakstzīme",
  },

  // Drošības validācija
  security: {
    "at-least-one-character-type-must-be-included": "Jāiekļauj vismaz viens rakstzīmes tips",
    "input-contains-potentially-dangerous-html": "Ievade satur potenciāli bīstamu HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Ievade satur potenciāli bīstamus SQL modeļus",
    "input-contains-potentially-dangerous-xss-patterns": "Ievade satur potenciāli bīstamus XSS modeļus",
    "input-contains-path-traversal-patterns": "Ievade satur ceļa šķērsošanas modeļus",
    "input-contains-windows-reserved-names": "Ievade satur Windows rezervētos nosaukumus",
    "input-contains-executable-file-extensions": "Ievade satur izpildāmo failu paplašinājumus",
    "input-contains-null-bytes": "Ievade satur null baitus",
    "input-contains-hidden-files": "Ievade satur paslēptus failus",
    "input-contains-javascript-file-extensions": "Ievade satur JavaScript failu paplašinājumus",
  },

  // Asinhronās operācijas
  async: {
    "operation-timed-out": "Operācija beidzās laikā",
    "custom-timeout": "Pielāgots laika limits",
    "original-error": "Sākotnējā kļūda",
    "first-failure": "Pirmā neveiksme",
    "second-failure": "Otrā neveiksme",
    "persistent-failure": "Pastāvīga neveiksme",
    "function-failed": "Funkcija neizdevās",
    "mapper-failed": "Mapper neizdevās",
    "concurrency-must-be-greater-than-0": "Vienlaicīgumam jābūt lielākam par 0",
    "polling-timeout-reached": "Sasniegts aptaujas laika limits",
  },

  // Moduļu ielāde
  module: {
    "is-null": "Modulis ir null",
    "invalid-structure": "Nederīga moduļa struktūra",
    "load-failed": "Ielāde neizdevās",
    "loading-failed": "Ielāde neizdevās",
  },

  // Glabāšana un serializācija
  storage: {
    "potentially-dangerous-json-detected": "Atklāts potenciāli bīstams JSON",
    "failed-to-parse-json-from-localstorage": "Neizdevās parsēt JSON no localStorage:",
    "error-parsing-storage-event": "Kļūda parsējot glabāšanas notikumu atslēgai",
  },

  // Tests un izstrāde
  test: {
    error: "Testa kļūda",
    message: "Testa ziņojums",
    notification: "Testa paziņojums",
    "notification-1": "Testa paziņojums 1",
    "notification-2": "Testa paziņojums 2",
  },

  // Vispārējās kļūdas
  errors: {
    "string-error": "Virknes kļūda",
    "crypto-error": "Kriptogrāfijas kļūda",
    "some-error": "Kāda kļūda",
  },

  // Formātētāji un rīki
  formatters: {
    "hello-world": "Sveika pasaule",
  },

  // Datums un laiks
  dateTime: {
    now: "Tagad",
    today: "Šodien",
    yesterday: "Vakar",
    tomorrow: "Rīt",
    format: "Formāts",
    timezone: "Laika zona",
  },

  // Integrācijas testi
  integration: {
    "session-and-api-key-generation": "Sesijas un API atslēgas ģenerēšana",
    "authentication-and-input-validation-integration": "Autentifikācijas un ievades validācijas integrācija",
    "performance-and-security-integration": "Veiktspējas un drošības integrācija",
  },
};
