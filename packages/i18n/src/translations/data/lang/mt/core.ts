/**
 * Traduzzjonijiet bażiċi Maltin għall-framework Reynard
 */
export const coreTranslations = {
  // Żbalji ta' konnessjoni u API
  connection: {
    failed: "Il-konnessjoni falliet",
  },

  network: {
    error: "Żball tan-netwerk",
  },

  request: {
    aborted: "It-talba ġiet abbandunata",
  },

  // Autentikazzjoni u sigurtà
  bearer: {
    token: "Token Bearer",
    "test-key": "Ċavetta tat-test Bearer",
    "new-key": "Ċavetta ġdida Bearer",
  },

  // Notifiki
  notifications: {
    title: "Notifiki",
    dismiss: "Iċħad",
    dismissAll: "Iċħad kollha",
    markAsRead: "Immarka bħala mqarija",
    markAllAsRead: "Immarka kollha bħala mqarija",
    noNotifications: "L-ebda notifika",
    error: "Żball",
    success: "Suċċess",
    warning: "Twissija",
    info: "Informazzjoni",
    test: "Notifika tat-test",
    "test-1": "Notifika tat-test 1",
    "test-2": "Notifika tat-test 2",
    first: "L-ewwel notifika",
    second: "It-tieni notifika",
    message: "Messaġġ tat-test",
    "default-message": "Messaġġ default",
    "first-message": "L-ewwel messaġġ",
    "second-message": "It-tieni messaġġ",
    "auto-dismiss": "Iċħad awtomatiku",
    "error-message": "Messaġġ ta' żball",
    "no-group-message": "Messaġġ mingħajr grupp",
    "upload-progress": "Progress tal-upload",
    "progress-test": "Test tal-progress",
    "progress-test-2": "Test tal-progress 2",
    "custom-duration": "Tul personalizzat",
    "group-message": "Messaġġ tal-grupp",
    "regular-message": "Messaġġ regolari",
    "created-notification": "Notifika maħluqa",
    "first-grouped": "L-ewwel gruppat",
    "second-grouped": "It-tieni gruppat",
  },

  // Messaġġi ta' validazzjoni
  validation: {
    required: "Dan il-qasam huwa meħtieġ",
    invalid: "Valur invalidu",
    tooShort: "Il-valur huwa qasir wisq",
    tooLong: "Il-valur huwa twil wisq",
    invalidEmail: "Indirizz email invalidu",
    invalidUrl: "URL invalidu",
    invalidNumber: "Numru invalidu",
    minValue: "Il-valur huwa żgħir wisq",
    maxValue: "Il-valur huwa kbir wisq",
    "invalid-input-type": "Tip ta' input invalidu",
    "does-not-match-pattern": "L-input ma jitwaħħalx mal-mudell meħtieġ",
  },

  // Validazzjoni tal-password
  password: {
    "must-be-at-least-8-characters-long": "Il-password għandha tkun tal-anqas 8 karattri",
    "must-contain-at-least-one-uppercase-letter": "Il-password għandha tinkludi tal-anqas ittra waħda kbira",
    "must-contain-at-least-one-lowercase-letter": "Il-password għandha tinkludi tal-anqas ittra waħda żgħira",
    "must-contain-at-least-one-number": "Il-password għandha tinkludi tal-anqas numru wieħed",
    "must-contain-at-least-one-special-character": "Il-password għandha tinkludi tal-anqas karattru speċjali wieħed",
  },

  // Validazzjoni tas-sigurtà
  security: {
    "at-least-one-character-type-must-be-included": "Tal-anqas tip ta' karattru wieħed għandu jkun inkluż",
    "input-contains-potentially-dangerous-html": "L-input fih HTML li jista' jkun perikoluż",
    "input-contains-potentially-dangerous-sql-patterns": "L-input fih mudelli SQL li jistgħu jkunu perikolużi",
    "input-contains-potentially-dangerous-xss-patterns": "L-input fih mudelli XSS li jistgħu jkunu perikolużi",
    "input-contains-path-traversal-patterns": "L-input fih mudelli ta' traversar tal-passaġġ",
    "input-contains-windows-reserved-names": "L-input fih ismijiet riżervati ta' Windows",
    "input-contains-executable-file-extensions": "L-input fih estensjonijiet ta' fajls eżekutabbli",
    "input-contains-null-bytes": "L-input fih bytes null",
    "input-contains-hidden-files": "L-input fih fajls moħbija",
    "input-contains-javascript-file-extensions": "L-input fih estensjonijiet ta' fajls JavaScript",
  },

  // Operazzjonijiet asinkroni
  async: {
    "operation-timed-out": "L-operazzjoni skadiet",
    "custom-timeout": "Timeout personalizzat",
    "original-error": "Żball oriġinali",
    "first-failure": "L-ewwel falliment",
    "second-failure": "It-tieni falliment",
    "persistent-failure": "Falliment persistenti",
    "function-failed": "Il-funzjoni falliet",
    "mapper-failed": "Il-mapper falliet",
    "concurrency-must-be-greater-than-0": "Il-konkorrenza għandha tkun akbar minn 0",
    "polling-timeout-reached": "Timeout tal-polling intlaħaq",
  },

  // Tagħbija tal-moduli
  module: {
    "is-null": "Il-modulu huwa null",
    "invalid-structure": "Struttura tal-modulu invalida",
    "load-failed": "It-tagħbija falliet",
    "loading-failed": "It-tagħbija falliet",
  },

  // Ħażna u serializzazzjoni
  storage: {
    "potentially-dangerous-json-detected": "JSON li jista' jkun perikoluż intlaħaq",
    "failed-to-parse-json-from-localstorage": "Ma rnexxilx jipparse JSON minn localStorage:",
    "error-parsing-storage-event": "Żball fil-parsing tal-avveniment tal-ħażna għall-ċavetta",
  },

  // Test u żvilupp
  test: {
    error: "Żball tat-test",
    message: "Messaġġ tat-test",
    notification: "Notifika tat-test",
    "notification-1": "Notifika tat-test 1",
    "notification-2": "Notifika tat-test 2",
  },

  // Żbalji ġenerali
  errors: {
    "string-error": "Żball ta' string",
    "crypto-error": "Żball kriptografiku",
    "some-error": "Xi żball",
  },

  // Formatters u utilities
  formatters: {
    "hello-world": "Bonġu dinja",
  },

  // Data u ħin
  dateTime: {
    now: "Issa",
    today: "Illum",
    yesterday: "Ilbieraħ",
    tomorrow: "Għada",
    format: "Format",
    timezone: "Żona tal-ħin",
  },

  // Testijiet ta' integrazzjoni
  integration: {
    "session-and-api-key-generation": "Ġenerazzjoni tas-sessjoni u ċavetta API",
    "authentication-and-input-validation-integration": "Integrazzjoni ta' autentikazzjoni u validazzjoni tal-input",
    "performance-and-security-integration": "Integrazzjoni tal-prestazzjoni u s-sigurtà",
  },
};
