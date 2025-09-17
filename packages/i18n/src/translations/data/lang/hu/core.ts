/**
 * Alapvető magyar fordítások a Reynard keretrendszerhez
 */
export const coreTranslations = {
  // Kapcsolat és API hibák
  connection: {
    failed: "Kapcsolat sikertelen",
  },

  network: {
    error: "Hálózati hiba",
  },

  request: {
    aborted: "Kérés megszakítva",
  },

  // Hitelesítés és biztonság
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer teszt kulcs",
    "new-key": "Bearer új kulcs",
  },

  // Értesítések
  notifications: {
    title: "Értesítések",
    dismiss: "Elutasítás",
    dismissAll: "Összes elutasítása",
    markAsRead: "Olvasottként jelölés",
    markAllAsRead: "Összes olvasottként jelölése",
    noNotifications: "Nincsenek értesítések",
    error: "Hiba",
    success: "Siker",
    warning: "Figyelmeztetés",
    info: "Információ",
    test: "Teszt értesítés",
    "test-1": "Teszt értesítés 1",
    "test-2": "Teszt értesítés 2",
    first: "Első értesítés",
    second: "Második értesítés",
    message: "Teszt üzenet",
    "default-message": "Alapértelmezett üzenet",
    "first-message": "Első üzenet",
    "second-message": "Második üzenet",
    "auto-dismiss": "Automatikus elutasítás",
    "error-message": "Hibaüzenet",
    "no-group-message": "Csoport nélküli üzenet",
    "upload-progress": "Feltöltés előrehaladása",
    "progress-test": "Előrehaladás teszt",
    "progress-test-2": "Előrehaladás teszt 2",
    "custom-duration": "Egyedi időtartam",
    "group-message": "Csoport üzenet",
    "regular-message": "Rendszeres üzenet",
    "created-notification": "Létrehozott értesítés",
    "first-grouped": "Első csoportosított",
    "second-grouped": "Második csoportosított",
  },

  // Validációs üzenetek
  validation: {
    required: "Ez a mező kötelező",
    invalid: "Érvénytelen érték",
    tooShort: "Az érték túl rövid",
    tooLong: "Az érték túl hosszú",
    invalidEmail: "Érvénytelen email cím",
    invalidUrl: "Érvénytelen URL",
    invalidNumber: "Érvénytelen szám",
    minValue: "Az érték túl kicsi",
    maxValue: "Az érték túl nagy",
    "invalid-input-type": "Érvénytelen bemeneti típus",
    "does-not-match-pattern": "A bemenet nem felel meg a szükséges mintának",
  },

  // Jelszó validáció
  password: {
    "must-be-at-least-8-characters-long": "A jelszónak legalább 8 karakter hosszúnak kell lennie",
    "must-contain-at-least-one-uppercase-letter": "A jelszónak legalább egy nagybetűt kell tartalmaznia",
    "must-contain-at-least-one-lowercase-letter": "A jelszónak legalább egy kisbetűt kell tartalmaznia",
    "must-contain-at-least-one-number": "A jelszónak legalább egy számot kell tartalmaznia",
    "must-contain-at-least-one-special-character": "A jelszónak legalább egy speciális karaktert kell tartalmaznia",
  },

  // Biztonsági validáció
  security: {
    "at-least-one-character-type-must-be-included": "Legalább egy karaktertípusnak szerepelnie kell",
    "input-contains-potentially-dangerous-html": "A bemenet potenciálisan veszélyes HTML-t tartalmaz",
    "input-contains-potentially-dangerous-sql-patterns": "A bemenet potenciálisan veszélyes SQL mintákat tartalmaz",
    "input-contains-potentially-dangerous-xss-patterns": "A bemenet potenciálisan veszélyes XSS mintákat tartalmaz",
    "input-contains-path-traversal-patterns": "A bemenet útvonal bejárási mintákat tartalmaz",
    "input-contains-windows-reserved-names": "A bemenet Windows fenntartott neveket tartalmaz",
    "input-contains-executable-file-extensions": "A bemenet végrehajtható fájl kiterjesztéseket tartalmaz",
    "input-contains-null-bytes": "A bemenet null bájtokat tartalmaz",
    "input-contains-hidden-files": "A bemenet rejtett fájlokat tartalmaz",
    "input-contains-javascript-file-extensions": "A bemenet JavaScript fájl kiterjesztéseket tartalmaz",
  },

  // Aszinkron műveletek
  async: {
    "operation-timed-out": "A művelet időtúllépés",
    "custom-timeout": "Egyedi timeout",
    "original-error": "Eredeti hiba",
    "first-failure": "Első hiba",
    "second-failure": "Második hiba",
    "persistent-failure": "Tartós hiba",
    "function-failed": "A függvény sikertelen",
    "mapper-failed": "A mapper sikertelen",
    "concurrency-must-be-greater-than-0": "A párhuzamosságnak 0-nál nagyobbnak kell lennie",
    "polling-timeout-reached": "Polling timeout elérve",
  },

  // Modul betöltés
  module: {
    "is-null": "A modul null",
    "invalid-structure": "Érvénytelen modul struktúra",
    "load-failed": "A betöltés sikertelen",
    "loading-failed": "A betöltés sikertelen",
  },

  // Tárolás és szerializálás
  storage: {
    "potentially-dangerous-json-detected": "Potenciálisan veszélyes JSON észlelve",
    "failed-to-parse-json-from-localstorage": "JSON elemzése localStorage-ból sikertelen:",
    "error-parsing-storage-event": "Hiba a tárolási esemény elemzésekor a kulcshoz",
  },

  // Teszt és fejlesztés
  test: {
    error: "Teszt hiba",
    message: "Teszt üzenet",
    notification: "Teszt értesítés",
    "notification-1": "Teszt értesítés 1",
    "notification-2": "Teszt értesítés 2",
  },

  // Általános hibák
  errors: {
    "string-error": "String hiba",
    "crypto-error": "Kripto hiba",
    "some-error": "Valamilyen hiba",
  },

  // Formázók és segédeszközök
  formatters: {
    "hello-world": "Helló világ",
  },

  // Dátum és idő
  dateTime: {
    now: "Most",
    today: "Ma",
    yesterday: "Tegnap",
    tomorrow: "Holnap",
    format: "Formátum",
    timezone: "Időzóna",
  },

  // Integrációs tesztek
  integration: {
    "session-and-api-key-generation": "Munkamenet és API kulcs generálás",
    "authentication-and-input-validation-integration": "Hitelesítés és bemenet validáció integráció",
    "performance-and-security-integration": "Teljesítmény és biztonság integráció",
  },
};
