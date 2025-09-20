/**
 * Základné slovenské preklady pre Reynard framework
 */
export const coreTranslations = {
  // Chyby pripojenia a API
  connection: {
    failed: "Pripojenie zlyhalo",
  },

  network: {
    error: "Chyba siete",
  },

  request: {
    aborted: "Požiadavka bola prerušená",
  },

  // Autentifikácia a bezpečnosť
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer testovací kľúč",
    "new-key": "Bearer nový kľúč",
  },

  // Oznámenia
  notifications: {
    title: "Oznámenia",
    dismiss: "Zamietnuť",
    dismissAll: "Zamietnuť všetky",
    markAsRead: "Označiť ako prečítané",
    markAllAsRead: "Označiť všetky ako prečítané",
    noNotifications: "Žiadne oznámenia",
    error: "Chyba",
    success: "Úspech",
    warning: "Varovanie",
    info: "Informácia",
    test: "Testovacie oznámenie",
    "test-1": "Testovacie oznámenie 1",
    "test-2": "Testovacie oznámenie 2",
    first: "Prvé oznámenie",
    second: "Druhé oznámenie",
    message: "Testovacia správa",
    "default-message": "Predvolená správa",
    "first-message": "Prvá správa",
    "second-message": "Druhá správa",
    "auto-dismiss": "Automatické zamietnutie",
    "error-message": "Chybová správa",
    "no-group-message": "Správa bez skupiny",
    "upload-progress": "Pokrok nahrávania",
    "progress-test": "Test pokroku",
    "progress-test-2": "Test pokroku 2",
    "custom-duration": "Vlastné trvanie",
    "group-message": "Správa skupiny",
    "regular-message": "Bežná správa",
    "created-notification": "Vytvorené oznámenie",
    "first-grouped": "Prvé zoskupené",
    "second-grouped": "Druhé zoskupené",
  },

  // Validačné správy
  validation: {
    required: "Toto pole je povinné",
    invalid: "Neplatná hodnota",
    tooShort: "Hodnota je príliš krátka",
    tooLong: "Hodnota je príliš dlhá",
    invalidEmail: "Neplatná e-mailová adresa",
    invalidUrl: "Neplatná URL",
    invalidNumber: "Neplatné číslo",
    minValue: "Hodnota je príliš malá",
    maxValue: "Hodnota je príliš veľká",
    "invalid-input-type": "Neplatný typ vstupu",
    "does-not-match-pattern": "Vstup nezodpovedá požadovanému vzoru",
  },

  // Validácia hesla
  password: {
    "must-be-at-least-8-characters-long": "Heslo musí mať aspoň 8 znakov",
    "must-contain-at-least-one-uppercase-letter": "Heslo musí obsahovať aspoň jedno veľké písmeno",
    "must-contain-at-least-one-lowercase-letter": "Heslo musí obsahovať aspoň jedno malé písmeno",
    "must-contain-at-least-one-number": "Heslo musí obsahovať aspoň jedno číslo",
    "must-contain-at-least-one-special-character": "Heslo musí obsahovať aspoň jeden špeciálny znak",
  },

  // Bezpečnostná validácia
  security: {
    "at-least-one-character-type-must-be-included": "Musí byť zahrnutý aspoň jeden typ znaku",
    "input-contains-potentially-dangerous-html": "Vstup obsahuje potenciálne nebezpečný HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Vstup obsahuje potenciálne nebezpečné SQL vzory",
    "input-contains-potentially-dangerous-xss-patterns": "Vstup obsahuje potenciálne nebezpečné XSS vzory",
    "input-contains-path-traversal-patterns": "Vstup obsahuje vzory prechádzania cesty",
    "input-contains-windows-reserved-names": "Vstup obsahuje rezervované názvy Windows",
    "input-contains-executable-file-extensions": "Vstup obsahuje prípony spustiteľných súborov",
    "input-contains-null-bytes": "Vstup obsahuje null bajty",
    "input-contains-hidden-files": "Vstup obsahuje skryté súbory",
    "input-contains-javascript-file-extensions": "Vstup obsahuje prípony JavaScript súborov",
  },

  // Asynchrónne operácie
  async: {
    "operation-timed-out": "Operácia vypršala",
    "custom-timeout": "Vlastný timeout",
    "original-error": "Pôvodná chyba",
    "first-failure": "Prvé zlyhanie",
    "second-failure": "Druhé zlyhanie",
    "persistent-failure": "Trvalé zlyhanie",
    "function-failed": "Funkcia zlyhala",
    "mapper-failed": "Mapper zlyhal",
    "concurrency-must-be-greater-than-0": "Súbežnosť musí byť väčšia ako 0",
    "polling-timeout-reached": "Dosiahnutý timeout dotazovania",
  },

  // Načítanie modulov
  module: {
    "is-null": "Modul je null",
    "invalid-structure": "Neplatná štruktúra modulu",
    "load-failed": "Načítanie zlyhalo",
    "loading-failed": "Načítanie zlyhalo",
  },

  // Úložisko a serializácia
  storage: {
    "potentially-dangerous-json-detected": "Detekovaný potenciálne nebezpečný JSON",
    "failed-to-parse-json-from-localstorage": "Nepodarilo sa parsovať JSON z localStorage:",
    "error-parsing-storage-event": "Chyba pri parsovaní udalosti úložiska pre kľúč",
  },

  // Test a vývoj
  test: {
    error: "Testovacia chyba",
    message: "Testovacia správa",
    notification: "Testovacie oznámenie",
    "notification-1": "Testovacie oznámenie 1",
    "notification-2": "Testovacie oznámenie 2",
  },

  // Všeobecné chyby
  errors: {
    "string-error": "Chyba reťazca",
    "crypto-error": "Kryptografická chyba",
    "some-error": "Nejaká chyba",
  },

  // Formátovače a nástroje
  formatters: {
    "hello-world": "Ahoj svet",
  },

  // Dátum a čas
  dateTime: {
    now: "Teraz",
    today: "Dnes",
    yesterday: "Včera",
    tomorrow: "Zajtra",
    format: "Formát",
    timezone: "Časové pásmo",
  },

  // Integračné testy
  integration: {
    "session-and-api-key-generation": "Generovanie relácie a API kľúča",
    "authentication-and-input-validation-integration": "Integrácia autentifikácie a validácie vstupu",
    "performance-and-security-integration": "Integrácia výkonu a bezpečnosti",
  },
};
