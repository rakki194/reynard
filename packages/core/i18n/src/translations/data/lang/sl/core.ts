/**
 * Osnovni slovenski prevodi za Reynard ogrodje
 */
export const coreTranslations = {
  // Napake povezave in API-ja
  connection: {
    failed: "Povezava ni uspela",
  },

  network: {
    error: "Omrežna napaka",
  },

  request: {
    aborted: "Zahteva prekinjena",
  },

  // Avtentifikacija in varnost
  bearer: {
    token: "Bearer žeton",
    "test-key": "Bearer testni ključ",
    "new-key": "Bearer novi ključ",
  },

  // Obvestila
  notifications: {
    title: "Obvestila",
    dismiss: "Zavrni",
    dismissAll: "Zavrni vsa",
    markAsRead: "Označi kot prebrano",
    markAllAsRead: "Označi vsa kot prebrana",
    noNotifications: "Ni obvestil",
    error: "Napaka",
    success: "Uspeh",
    warning: "Opozorilo",
    info: "Informacija",
    test: "Testno obvestilo",
    "test-1": "Testno obvestilo 1",
    "test-2": "Testno obvestilo 2",
    first: "Prvo obvestilo",
    second: "Drugo obvestilo",
    message: "Testno sporočilo",
    "default-message": "Privzeto sporočilo",
    "first-message": "Prvo sporočilo",
    "second-message": "Drugo sporočilo",
    "auto-dismiss": "Samodejno zavračanje",
    "error-message": "Sporočilo o napaki",
    "no-group-message": "Sporočilo brez skupine",
    "upload-progress": "Napredek nalaganja",
    "progress-test": "Test napredka",
    "progress-test-2": "Test napredka 2",
    "custom-duration": "Prilagojeno trajanje",
    "group-message": "Sporočilo skupine",
    "regular-message": "Običajno sporočilo",
    "created-notification": "Ustvarjeno obvestilo",
    "first-grouped": "Prvo združeno",
    "second-grouped": "Drugo združeno",
  },

  // Sporočila validacije
  validation: {
    required: "To polje je obvezno",
    invalid: "Neveljavna vrednost",
    tooShort: "Vrednost je prekratka",
    tooLong: "Vrednost je predolga",
    invalidEmail: "Neveljaven e-poštni naslov",
    invalidUrl: "Neveljaven URL",
    invalidNumber: "Neveljavna številka",
    minValue: "Vrednost je premajhna",
    maxValue: "Vrednost je prevelika",
    "invalid-input-type": "Neveljaven tip vnosa",
    "does-not-match-pattern": "Vnos se ne ujema z zahtevanim vzorcem",
  },

  // Validacija gesla
  password: {
    "must-be-at-least-8-characters-long": "Geslo mora imeti vsaj 8 znakov",
    "must-contain-at-least-one-uppercase-letter": "Geslo mora vsebovati vsaj eno veliko črko",
    "must-contain-at-least-one-lowercase-letter": "Geslo mora vsebovati vsaj eno malo črko",
    "must-contain-at-least-one-number": "Geslo mora vsebovati vsaj eno številko",
    "must-contain-at-least-one-special-character": "Geslo mora vsebovati vsaj en poseben znak",
  },

  // Validacija varnosti
  security: {
    "at-least-one-character-type-must-be-included": "Vključen mora biti vsaj en tip znaka",
    "input-contains-potentially-dangerous-html": "Vnos vsebuje potencialno nevaren HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Vnos vsebuje potencialno nevarne SQL vzorce",
    "input-contains-potentially-dangerous-xss-patterns": "Vnos vsebuje potencialno nevarne XSS vzorce",
    "input-contains-path-traversal-patterns": "Vnos vsebuje vzorce prečkanja poti",
    "input-contains-windows-reserved-names": "Vnos vsebuje rezervirana imena Windows",
    "input-contains-executable-file-extensions": "Vnos vsebuje razširitve izvršljivih datotek",
    "input-contains-null-bytes": "Vnos vsebuje null bajte",
    "input-contains-hidden-files": "Vnos vsebuje skrite datoteke",
    "input-contains-javascript-file-extensions": "Vnos vsebuje razširitve JavaScript datotek",
  },

  // Asinhrone operacije
  async: {
    "operation-timed-out": "Operacija je potekla",
    "custom-timeout": "Prilagojen timeout",
    "original-error": "Prvotna napaka",
    "first-failure": "Prva napaka",
    "second-failure": "Druga napaka",
    "persistent-failure": "Vztrajna napaka",
    "function-failed": "Funkcija ni uspela",
    "mapper-failed": "Mapper ni uspel",
    "concurrency-must-be-greater-than-0": "Sočasnost mora biti večja od 0",
    "polling-timeout-reached": "Dosežen timeout ankete",
  },

  // Nalaganje modulov
  module: {
    "is-null": "Modul je null",
    "invalid-structure": "Neveljavna struktura modula",
    "load-failed": "Nalaganje ni uspelo",
    "loading-failed": "Nalaganje ni uspelo",
  },

  // Shranjevanje in serializacija
  storage: {
    "potentially-dangerous-json-detected": "Zaznan potencialno nevaren JSON",
    "failed-to-parse-json-from-localstorage": "Razčlenjevanje JSON iz localStorage ni uspelo:",
    "error-parsing-storage-event": "Napaka pri razčlenjevanju dogodka shranjevanja za ključ",
  },

  // Test in razvoj
  test: {
    error: "Testna napaka",
    message: "Testno sporočilo",
    notification: "Testno obvestilo",
    "notification-1": "Testno obvestilo 1",
    "notification-2": "Testno obvestilo 2",
  },

  // Splošne napake
  errors: {
    "string-error": "Napaka niza",
    "crypto-error": "Kriptografska napaka",
    "some-error": "Neka napaka",
  },

  // Oblikovalci in orodja
  formatters: {
    "hello-world": "Pozdravljen svet",
  },

  // Datum in čas
  dateTime: {
    now: "Zdaj",
    today: "Danes",
    yesterday: "Včeraj",
    tomorrow: "Jutri",
    format: "Format",
    timezone: "Časovni pas",
  },

  // Integracijski testi
  integration: {
    "session-and-api-key-generation": "Generiranje seje in API ključa",
    "authentication-and-input-validation-integration": "Integracija avtentifikacije in validacije vnosa",
    "performance-and-security-integration": "Integracija zmogljivosti in varnosti",
  },
};
