/**
 * Põhilised eesti tõlked Reynard raamistikule
 */
export const coreTranslations = {
  // Ühenduse ja API vead
  connection: {
    failed: "Ühendus ebaõnnestus",
  },

  network: {
    error: "Võrgu viga",
  },

  request: {
    aborted: "Päring katkestatud",
  },

  // Autentimine ja turvalisus
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer testvõti",
    "new-key": "Bearer uus võti",
  },

  // Teated
  notifications: {
    title: "Teated",
    dismiss: "Lükka tagasi",
    dismissAll: "Lükka kõik tagasi",
    markAsRead: "Märgi loetuks",
    markAllAsRead: "Märgi kõik loetuks",
    noNotifications: "Teateid pole",
    error: "Viga",
    success: "Õnnestus",
    warning: "Hoiatus",
    info: "Teave",
    test: "Testteade",
    "test-1": "Testteade 1",
    "test-2": "Testteade 2",
    first: "Esimene teade",
    second: "Teine teade",
    message: "Testsõnum",
    "default-message": "Vaikimisi sõnum",
    "first-message": "Esimene sõnum",
    "second-message": "Teine sõnum",
    "auto-dismiss": "Automaatne tagasilükkamine",
    "error-message": "Veasõnum",
    "no-group-message": "Sõnum ilma grupita",
    "upload-progress": "Üleslaadimise edenemine",
    "progress-test": "Edusammu test",
    "progress-test-2": "Edusammu test 2",
    "custom-duration": "Kohandatud kestus",
    "group-message": "Grupi sõnum",
    "regular-message": "Tavaline sõnum",
    "created-notification": "Loodud teade",
    "first-grouped": "Esimene grupeeritud",
    "second-grouped": "Teine grupeeritud",
  },

  // Valideerimise sõnumid
  validation: {
    required: "See väli on kohustuslik",
    invalid: "Vigane väärtus",
    tooShort: "Väärtus on liiga lühike",
    tooLong: "Väärtus on liiga pikk",
    invalidEmail: "Vigane e-posti aadress",
    invalidUrl: "Vigane URL",
    invalidNumber: "Vigane number",
    minValue: "Väärtus on liiga väike",
    maxValue: "Väärtus on liiga suur",
    "invalid-input-type": "Vigane sisendi tüüp",
    "does-not-match-pattern": "Sisend ei vasta nõutud mustrile",
  },

  // Parooli valideerimine
  password: {
    "must-be-at-least-8-characters-long": "Parool peab olema vähemalt 8 tähemärki",
    "must-contain-at-least-one-uppercase-letter": "Parool peab sisaldama vähemalt üht suurt tähte",
    "must-contain-at-least-one-lowercase-letter": "Parool peab sisaldama vähemalt üht väikest tähte",
    "must-contain-at-least-one-number": "Parool peab sisaldama vähemalt üht numbrit",
    "must-contain-at-least-one-special-character": "Parool peab sisaldama vähemalt üht erimärki",
  },

  // Turvalisuse valideerimine
  security: {
    "at-least-one-character-type-must-be-included": "Peab olema kaasatud vähemalt üks tähemärgi tüüp",
    "input-contains-potentially-dangerous-html": "Sisend sisaldab potentsiaalselt ohtlikku HTML-i",
    "input-contains-potentially-dangerous-sql-patterns": "Sisend sisaldab potentsiaalselt ohtlikke SQL mustreid",
    "input-contains-potentially-dangerous-xss-patterns": "Sisend sisaldab potentsiaalselt ohtlikke XSS mustreid",
    "input-contains-path-traversal-patterns": "Sisend sisaldab tee läbimise mustreid",
    "input-contains-windows-reserved-names": "Sisend sisaldab Windowsi reserveeritud nimesid",
    "input-contains-executable-file-extensions": "Sisend sisaldab täidetavate failide laiendeid",
    "input-contains-null-bytes": "Sisend sisaldab null baite",
    "input-contains-hidden-files": "Sisend sisaldab peidetud faile",
    "input-contains-javascript-file-extensions": "Sisend sisaldab JavaScript failide laiendeid",
  },

  // Asünkroonsed toimingud
  async: {
    "operation-timed-out": "Toiming aegus",
    "custom-timeout": "Kohandatud timeout",
    "original-error": "Algne viga",
    "first-failure": "Esimene ebaõnnestumine",
    "second-failure": "Teine ebaõnnestumine",
    "persistent-failure": "Püsiv ebaõnnestumine",
    "function-failed": "Funktsioon ebaõnnestus",
    "mapper-failed": "Mapper ebaõnnestus",
    "concurrency-must-be-greater-than-0": "Samaaegsus peab olema suurem kui 0",
    "polling-timeout-reached": "Pollingu timeout saavutatud",
  },

  // Moodulite laadimine
  module: {
    "is-null": "Moodul on null",
    "invalid-structure": "Vigane mooduli struktuur",
    "load-failed": "Laadimine ebaõnnestus",
    "loading-failed": "Laadimine ebaõnnestus",
  },

  // Salvestamine ja serialiseerimine
  storage: {
    "potentially-dangerous-json-detected": "Tuvastatud potentsiaalselt ohtlik JSON",
    "failed-to-parse-json-from-localstorage": "JSON-i parsimine localStorage-ist ebaõnnestus:",
    "error-parsing-storage-event": "Viga salvestamise sündmuse parsimisel võtme jaoks",
  },

  // Test ja arendus
  test: {
    error: "Testi viga",
    message: "Testi sõnum",
    notification: "Testi teade",
    "notification-1": "Testi teade 1",
    "notification-2": "Testi teade 2",
  },

  // Üldised vead
  errors: {
    "string-error": "Stringi viga",
    "crypto-error": "Krüpto viga",
    "some-error": "Mingi viga",
  },

  // Formaadid ja utiliidid
  formatters: {
    "hello-world": "Tere maailm",
  },

  // Kuupäev ja aeg
  dateTime: {
    now: "Nüüd",
    today: "Täna",
    yesterday: "Eile",
    tomorrow: "Homme",
    format: "Formaat",
    timezone: "Ajavöönd",
  },

  // Integratsiooni testid
  integration: {
    "session-and-api-key-generation": "Sessiooni ja API võtme genereerimine",
    "authentication-and-input-validation-integration": "Autentimise ja sisendi valideerimise integratsioon",
    "performance-and-security-integration": "Jõudluse ja turvalisuse integratsioon",
  },
};
