/**
 * Osnovni hrvatski prijevodi za Reynard okvir
 */
export const coreTranslations = {
  // Greške veze i API-ja
  connection: {
    failed: "Veza neuspješna",
  },

  network: {
    error: "Mrežna greška",
  },

  request: {
    aborted: "Zahtjev prekinut",
  },

  // Autentifikacija i sigurnost
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer test ključ",
    "new-key": "Bearer novi ključ",
  },

  // Obavještenja
  notifications: {
    title: "Obavještenja",
    dismiss: "Odbaci",
    dismissAll: "Odbaci sve",
    markAsRead: "Označi kao pročitano",
    markAllAsRead: "Označi sve kao pročitano",
    noNotifications: "Nema obavještenja",
    error: "Greška",
    success: "Uspjeh",
    warning: "Upozorenje",
    info: "Informacija",
    test: "Test obavještenje",
    "test-1": "Test obavještenje 1",
    "test-2": "Test obavještenje 2",
    first: "Prvo obavještenje",
    second: "Drugo obavještenje",
    message: "Test poruka",
    "default-message": "Zadana poruka",
    "first-message": "Prva poruka",
    "second-message": "Druga poruka",
    "auto-dismiss": "Automatsko odbacivanje",
    "error-message": "Poruka greške",
    "no-group-message": "Poruka bez grupe",
    "upload-progress": "Napredak prijenosa",
    "progress-test": "Test napretka",
    "progress-test-2": "Test napretka 2",
    "custom-duration": "Prilagođeno trajanje",
    "group-message": "Poruka grupe",
    "regular-message": "Obična poruka",
    "created-notification": "Stvoreno obavještenje",
    "first-grouped": "Prvo grupirano",
    "second-grouped": "Drugo grupirano",
  },

  // Poruke validacije
  validation: {
    required: "Ovo polje je obavezno",
    invalid: "Nevaljana vrijednost",
    tooShort: "Vrijednost je prekratka",
    tooLong: "Vrijednost je predugačka",
    invalidEmail: "Nevaljana email adresa",
    invalidUrl: "Nevaljana URL",
    invalidNumber: "Nevaljan broj",
    minValue: "Vrijednost je premala",
    maxValue: "Vrijednost je prevelika",
    "invalid-input-type": "Nevaljan tip unosa",
    "does-not-match-pattern": "Unos se ne podudara s potrebnim uzorkom",
  },

  // Validacija lozinke
  password: {
    "must-be-at-least-8-characters-long": "Lozinka mora imati najmanje 8 znakova",
    "must-contain-at-least-one-uppercase-letter": "Lozinka mora sadržavati najmanje jedno veliko slovo",
    "must-contain-at-least-one-lowercase-letter": "Lozinka mora sadržavati najmanje jedno malo slovo",
    "must-contain-at-least-one-number": "Lozinka mora sadržavati najmanje jedan broj",
    "must-contain-at-least-one-special-character": "Lozinka mora sadržavati najmanje jedan poseban znak",
  },

  // Validacija sigurnosti
  security: {
    "at-least-one-character-type-must-be-included": "Mora biti uključen najmanje jedan tip znaka",
    "input-contains-potentially-dangerous-html": "Unos sadrži potencijalno opasan HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Unos sadrži potencijalno opasne SQL uzorke",
    "input-contains-potentially-dangerous-xss-patterns": "Unos sadrži potencijalno opasne XSS uzorke",
    "input-contains-path-traversal-patterns": "Unos sadrži uzorke prelaska putanje",
    "input-contains-windows-reserved-names": "Unos sadrži rezervirana imena Windows-a",
    "input-contains-executable-file-extensions": "Unos sadrži ekstenzije izvršnih datoteka",
    "input-contains-null-bytes": "Unos sadrži null bajtove",
    "input-contains-hidden-files": "Unos sadrži skrivene datoteke",
    "input-contains-javascript-file-extensions": "Unos sadrži ekstenzije JavaScript datoteka",
  },

  // Asinkrone operacije
  async: {
    "operation-timed-out": "Operacija je istekla",
    "custom-timeout": "Prilagođeni timeout",
    "original-error": "Izvorna greška",
    "first-failure": "Prvi neuspjeh",
    "second-failure": "Drugi neuspjeh",
    "persistent-failure": "Trajni neuspjeh",
    "function-failed": "Funkcija neuspješna",
    "mapper-failed": "Mapper neuspješan",
    "concurrency-must-be-greater-than-0": "Istodobnost mora biti veća od 0",
    "polling-timeout-reached": "Dostignut timeout ankete",
  },

  // Učitavanje modula
  module: {
    "is-null": "Modul je null",
    "invalid-structure": "Nevaljana struktura modula",
    "load-failed": "Učitavanje neuspješno",
    "loading-failed": "Učitavanje neuspješno",
  },

  // Pohrana i serijalizacija
  storage: {
    "potentially-dangerous-json-detected": "Otkriven potencijalno opasan JSON",
    "failed-to-parse-json-from-localstorage": "Neuspješno parsiranje JSON-a iz localStorage:",
    "error-parsing-storage-event": "Greška pri parsiranju događaja pohrane za ključ",
  },

  // Test i razvoj
  test: {
    error: "Test greška",
    message: "Test poruka",
    notification: "Test obavještenje",
    "notification-1": "Test obavještenje 1",
    "notification-2": "Test obavještenje 2",
  },

  // Opće greške
  errors: {
    "string-error": "Greška niza",
    "crypto-error": "Kripto greška",
    "some-error": "Neka greška",
  },

  // Formatirači i alati
  formatters: {
    "hello-world": "Pozdrav svijete",
  },

  // Datum i vrijeme
  dateTime: {
    now: "Sada",
    today: "Danas",
    yesterday: "Jučer",
    tomorrow: "Sutra",
    format: "Format",
    timezone: "Vremenska zona",
  },

  // Testovi integracije
  integration: {
    "session-and-api-key-generation": "Generiranje sesije i API ključa",
    "authentication-and-input-validation-integration": "Integracija autentifikacije i validacije unosa",
    "performance-and-security-integration": "Integracija performansi i sigurnosti",
  },
};
