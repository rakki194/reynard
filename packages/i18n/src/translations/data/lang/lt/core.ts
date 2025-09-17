/**
 * Pagrindiniai lietuvių kalbos vertimai Reynard sistemai
 */
export const coreTranslations = {
  // Ryšio ir API klaidų
  connection: {
    failed: "Ryšys nepavyko",
  },

  network: {
    error: "Tinklo klaida",
  },

  request: {
    aborted: "Užklausa nutraukta",
  },

  // Autentifikavimas ir saugumas
  bearer: {
    token: "Bearer žetonas",
    "test-key": "Bearer testinis raktas",
    "new-key": "Bearer naujas raktas",
  },

  // Pranešimai
  notifications: {
    title: "Pranešimai",
    dismiss: "Atmesti",
    dismissAll: "Atmesti visus",
    markAsRead: "Pažymėti kaip perskaitytą",
    markAllAsRead: "Pažymėti visus kaip perskaitytus",
    noNotifications: "Nėra pranešimų",
    error: "Klaida",
    success: "Sėkmė",
    warning: "Įspėjimas",
    info: "Informacija",
    test: "Testinis pranešimas",
    "test-1": "Testinis pranešimas 1",
    "test-2": "Testinis pranešimas 2",
    first: "Pirmas pranešimas",
    second: "Antras pranešimas",
    message: "Testinis pranešimas",
    "default-message": "Numatytasis pranešimas",
    "first-message": "Pirmas pranešimas",
    "second-message": "Antras pranešimas",
    "auto-dismiss": "Automatinis atmetimas",
    "error-message": "Klaidos pranešimas",
    "no-group-message": "Pranešimas be grupės",
    "upload-progress": "Įkėlimo progresas",
    "progress-test": "Progreso testas",
    "progress-test-2": "Progreso testas 2",
    "custom-duration": "Pritaikytas trukmė",
    "group-message": "Grupės pranešimas",
    "regular-message": "Įprastas pranešimas",
    "created-notification": "Sukurtas pranešimas",
    "first-grouped": "Pirmas sugrupuotas",
    "second-grouped": "Antras sugrupuotas",
  },

  // Validavimo pranešimai
  validation: {
    required: "Šis laukas yra privalomas",
    invalid: "Netinkama reikšmė",
    tooShort: "Reikšmė per trumpa",
    tooLong: "Reikšmė per ilga",
    invalidEmail: "Netinkamas el. pašto adresas",
    invalidUrl: "Netinkamas URL",
    invalidNumber: "Netinkamas skaičius",
    minValue: "Reikšmė per maža",
    maxValue: "Reikšmė per didelė",
    "invalid-input-type": "Netinkamas įvesties tipas",
    "does-not-match-pattern": "Įvestis neatitinka reikiamo šablono",
  },

  // Slaptažodžio validavimas
  password: {
    "must-be-at-least-8-characters-long": "Slaptažodis turi būti bent 8 simbolių",
    "must-contain-at-least-one-uppercase-letter": "Slaptažodis turi turėti bent vieną didžiąją raidę",
    "must-contain-at-least-one-lowercase-letter": "Slaptažodis turi turėti bent vieną mažąją raidę",
    "must-contain-at-least-one-number": "Slaptažodis turi turėti bent vieną skaičių",
    "must-contain-at-least-one-special-character": "Slaptažodis turi turėti bent vieną specialų simbolį",
  },

  // Saugumo validavimas
  security: {
    "at-least-one-character-type-must-be-included": "Turi būti įtrauktas bent vienas simbolio tipas",
    "input-contains-potentially-dangerous-html": "Įvestis turi potencialiai pavojingą HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Įvestis turi potencialiai pavojingus SQL šablonus",
    "input-contains-potentially-dangerous-xss-patterns": "Įvestis turi potencialiai pavojingus XSS šablonus",
    "input-contains-path-traversal-patterns": "Įvestis turi kelio perėjimo šablonus",
    "input-contains-windows-reserved-names": "Įvestis turi Windows rezervuotus vardus",
    "input-contains-executable-file-extensions": "Įvestis turi vykdomų failų plėtinius",
    "input-contains-null-bytes": "Įvestis turi null baitus",
    "input-contains-hidden-files": "Įvestis turi paslėptus failus",
    "input-contains-javascript-file-extensions": "Įvestis turi JavaScript failų plėtinius",
  },

  // Asinchroninės operacijos
  async: {
    "operation-timed-out": "Operacija baigėsi laiku",
    "custom-timeout": "Pritaikytas laiko limitas",
    "original-error": "Originali klaida",
    "first-failure": "Pirmasis nesėkmė",
    "second-failure": "Antrasis nesėkmė",
    "persistent-failure": "Nuolatinis nesėkmė",
    "function-failed": "Funkcija nepavyko",
    "mapper-failed": "Mapper nepavyko",
    "concurrency-must-be-greater-than-0": "Lygiagretumas turi būti didesnis nei 0",
    "polling-timeout-reached": "Pasiektas apklausos laiko limitas",
  },

  // Modulių įkėlimas
  module: {
    "is-null": "Modulis yra null",
    "invalid-structure": "Netinkama modulio struktūra",
    "load-failed": "Įkėlimas nepavyko",
    "loading-failed": "Įkėlimas nepavyko",
  },

  // Saugojimas ir serializavimas
  storage: {
    "potentially-dangerous-json-detected": "Aptiktas potencialiai pavojingas JSON",
    "failed-to-parse-json-from-localstorage": "Nepavyko išanalizuoti JSON iš localStorage:",
    "error-parsing-storage-event": "Klaida analizuojant saugojimo įvykį raktui",
  },

  // Testavimas ir plėtra
  test: {
    error: "Testo klaida",
    message: "Testo pranešimas",
    notification: "Testo pranešimas",
    "notification-1": "Testo pranešimas 1",
    "notification-2": "Testo pranešimas 2",
  },

  // Bendros klaidos
  errors: {
    "string-error": "Eilutės klaida",
    "crypto-error": "Kriptografijos klaida",
    "some-error": "Kokia nors klaida",
  },

  // Formatuotojai ir įrankiai
  formatters: {
    "hello-world": "Sveikas pasauli",
  },

  // Data ir laikas
  dateTime: {
    now: "Dabar",
    today: "Šiandien",
    yesterday: "Vakar",
    tomorrow: "Rytoj",
    format: "Formatas",
    timezone: "Laiko juosta",
  },

  // Integracijos testai
  integration: {
    "session-and-api-key-generation": "Sesijos ir API rakto generavimas",
    "authentication-and-input-validation-integration": "Autentifikavimo ir įvesties validavimo integracija",
    "performance-and-security-integration": "Veikimo ir saugumo integracija",
  },
};
