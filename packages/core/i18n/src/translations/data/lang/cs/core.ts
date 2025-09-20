/**
 * Základní české překlady pro Reynard framework
 */
export const coreTranslations = {
  // Chyby připojení a API
  connection: {
    failed: "Připojení se nezdařilo",
  },

  network: {
    error: "Chyba sítě",
  },

  request: {
    aborted: "Požadavek byl přerušen",
  },

  // Autentizace a bezpečnost
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer testovací klíč",
    "new-key": "Bearer nový klíč",
  },

  // Oznámení
  notifications: {
    title: "Oznámení",
    dismiss: "Zavřít",
    dismissAll: "Zavřít vše",
    markAsRead: "Označit jako přečtené",
    markAllAsRead: "Označit vše jako přečtené",
    noNotifications: "Žádná oznámení",
    error: "Chyba",
    success: "Úspěch",
    warning: "Varování",
    info: "Informace",
    test: "Testovací oznámení",
    "test-1": "Testovací oznámení 1",
    "test-2": "Testovací oznámení 2",
    first: "První oznámení",
    second: "Druhé oznámení",
    message: "Testovací zpráva",
    "default-message": "Výchozí zpráva",
    "first-message": "První zpráva",
    "second-message": "Druhá zpráva",
    "auto-dismiss": "Automatické zavření",
    "error-message": "Chybová zpráva",
    "no-group-message": "Zpráva bez skupiny",
    "upload-progress": "Průběh nahrávání",
    "progress-test": "Test průběhu",
    "progress-test-2": "Test průběhu 2",
    "custom-duration": "Vlastní doba trvání",
    "group-message": "Zpráva skupiny",
    "regular-message": "Běžná zpráva",
    "created-notification": "Vytvořené oznámení",
    "first-grouped": "První seskupené",
    "second-grouped": "Druhé seskupené",
  },

  // Validační zprávy
  validation: {
    required: "Toto pole je povinné",
    invalid: "Neplatná hodnota",
    tooShort: "Hodnota je příliš krátká",
    tooLong: "Hodnota je příliš dlouhá",
    invalidEmail: "Neplatná e-mailová adresa",
    invalidUrl: "Neplatná URL",
    invalidNumber: "Neplatné číslo",
    minValue: "Hodnota je příliš malá",
    maxValue: "Hodnota je příliš velká",
    "invalid-input-type": "Neplatný typ vstupu",
    "does-not-match-pattern": "Vstup neodpovídá požadovanému vzoru",
  },

  // Validace hesla
  password: {
    "must-be-at-least-8-characters-long": "Heslo musí mít alespoň 8 znaků",
    "must-contain-at-least-one-uppercase-letter": "Heslo musí obsahovat alespoň jedno velké písmeno",
    "must-contain-at-least-one-lowercase-letter": "Heslo musí obsahovat alespoň jedno malé písmeno",
    "must-contain-at-least-one-number": "Heslo musí obsahovat alespoň jedno číslo",
    "must-contain-at-least-one-special-character": "Heslo musí obsahovat alespoň jeden speciální znak",
  },

  // Bezpečnostní validace
  security: {
    "at-least-one-character-type-must-be-included": "Musí být zahrnut alespoň jeden typ znaku",
    "input-contains-potentially-dangerous-html": "Vstup obsahuje potenciálně nebezpečný HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Vstup obsahuje potenciálně nebezpečné SQL vzory",
    "input-contains-potentially-dangerous-xss-patterns": "Vstup obsahuje potenciálně nebezpečné XSS vzory",
    "input-contains-path-traversal-patterns": "Vstup obsahuje vzory procházení cest",
    "input-contains-windows-reserved-names": "Vstup obsahuje rezervované názvy Windows",
    "input-contains-executable-file-extensions": "Vstup obsahuje přípony spustitelných souborů",
    "input-contains-null-bytes": "Vstup obsahuje null bajty",
    "input-contains-hidden-files": "Vstup obsahuje skryté soubory",
    "input-contains-javascript-file-extensions": "Vstup obsahuje přípony JavaScript souborů",
  },

  // Asynchronní operace
  async: {
    "operation-timed-out": "Operace vypršela",
    "custom-timeout": "Vlastní timeout",
    "original-error": "Původní chyba",
    "first-failure": "První selhání",
    "second-failure": "Druhé selhání",
    "persistent-failure": "Trvalé selhání",
    "function-failed": "Funkce selhala",
    "mapper-failed": "Mapper selhal",
    "concurrency-must-be-greater-than-0": "Souběžnost musí být větší než 0",
    "polling-timeout-reached": "Dosažen timeout dotazování",
  },

  // Načítání modulů
  module: {
    "is-null": "Modul je null",
    "invalid-structure": "Neplatná struktura modulu",
    "load-failed": "Načítání selhalo",
    "loading-failed": "Načítání selhalo",
  },

  // Úložiště a serializace
  storage: {
    "potentially-dangerous-json-detected": "Detekován potenciálně nebezpečný JSON",
    "failed-to-parse-json-from-localstorage": "Nepodařilo se parsovat JSON z localStorage:",
    "error-parsing-storage-event": "Chyba při parsování události úložiště pro klíč",
  },

  // Test a vývoj
  test: {
    error: "Testovací chyba",
    message: "Testovací zpráva",
    notification: "Testovací oznámení",
    "notification-1": "Testovací oznámení 1",
    "notification-2": "Testovací oznámení 2",
  },

  // Obecné chyby
  errors: {
    "string-error": "Chyba řetězce",
    "crypto-error": "Kryptografická chyba",
    "some-error": "Nějaká chyba",
  },

  // Formátovače a utility
  formatters: {
    "hello-world": "Ahoj světe",
  },

  // Datum a čas
  dateTime: {
    now: "Nyní",
    today: "Dnes",
    yesterday: "Včera",
    tomorrow: "Zítra",
    format: "Formát",
    timezone: "Časové pásmo",
  },

  // Integrační testy
  integration: {
    "session-and-api-key-generation": "Generování relace a API klíče",
    "authentication-and-input-validation-integration": "Integrace autentizace a validace vstupu",
    "performance-and-security-integration": "Integrace výkonu a bezpečnosti",
  },
};
