/**
 * Traduceri de bază în română pentru framework-ul Reynard
 */
export const coreTranslations = {
  // Erori de conexiune și API
  connection: {
    failed: "Conexiunea a eșuat",
  },

  network: {
    error: "Eroare de rețea",
  },

  request: {
    aborted: "Cererea a fost întreruptă",
  },

  // Autentificare și securitate
  bearer: {
    token: "Token Bearer",
    "test-key": "Cheie de test Bearer",
    "new-key": "Cheie nouă Bearer",
  },

  // Notificări
  notifications: {
    title: "Notificări",
    dismiss: "Respinge",
    dismissAll: "Respinge toate",
    markAsRead: "Marchează ca citit",
    markAllAsRead: "Marchează toate ca citite",
    noNotifications: "Fără notificări",
    error: "Eroare",
    success: "Succes",
    warning: "Avertisment",
    info: "Informație",
    test: "Notificare de test",
    "test-1": "Notificare de test 1",
    "test-2": "Notificare de test 2",
    first: "Prima notificare",
    second: "A doua notificare",
    message: "Mesaj de test",
    "default-message": "Mesaj implicit",
    "first-message": "Primul mesaj",
    "second-message": "Al doilea mesaj",
    "auto-dismiss": "Respinge automat",
    "error-message": "Mesaj de eroare",
    "no-group-message": "Mesaj fără grup",
    "upload-progress": "Progresul încărcării",
    "progress-test": "Test de progres",
    "progress-test-2": "Test de progres 2",
    "custom-duration": "Durată personalizată",
    "group-message": "Mesaj de grup",
    "regular-message": "Mesaj obișnuit",
    "created-notification": "Notificare creată",
    "first-grouped": "Primul grupat",
    "second-grouped": "Al doilea grupat",
  },

  // Mesaje de validare
  validation: {
    required: "Acest câmp este obligatoriu",
    invalid: "Valoare invalidă",
    tooShort: "Valoarea este prea scurtă",
    tooLong: "Valoarea este prea lungă",
    invalidEmail: "Adresă de email invalidă",
    invalidUrl: "URL invalid",
    invalidNumber: "Număr invalid",
    minValue: "Valoarea este prea mică",
    maxValue: "Valoarea este prea mare",
    "invalid-input-type": "Tip de intrare invalid",
    "does-not-match-pattern": "Intrarea nu se potrivește cu modelul necesar",
  },

  // Validarea parolei
  password: {
    "must-be-at-least-8-characters-long": "Parola trebuie să aibă cel puțin 8 caractere",
    "must-contain-at-least-one-uppercase-letter": "Parola trebuie să conțină cel puțin o literă mare",
    "must-contain-at-least-one-lowercase-letter": "Parola trebuie să conțină cel puțin o literă mică",
    "must-contain-at-least-one-number": "Parola trebuie să conțină cel puțin un număr",
    "must-contain-at-least-one-special-character": "Parola trebuie să conțină cel puțin un caracter special",
  },

  // Validarea securității
  security: {
    "at-least-one-character-type-must-be-included": "Cel puțin un tip de caracter trebuie inclus",
    "input-contains-potentially-dangerous-html": "Intrarea conține HTML potențial periculos",
    "input-contains-potentially-dangerous-sql-patterns": "Intrarea conține modele SQL potențial periculoase",
    "input-contains-potentially-dangerous-xss-patterns": "Intrarea conține modele XSS potențial periculoase",
    "input-contains-path-traversal-patterns": "Intrarea conține modele de traversare a căii",
    "input-contains-windows-reserved-names": "Intrarea conține nume rezervate Windows",
    "input-contains-executable-file-extensions": "Intrarea conține extensii de fișiere executabile",
    "input-contains-null-bytes": "Intrarea conține bytes null",
    "input-contains-hidden-files": "Intrarea conține fișiere ascunse",
    "input-contains-javascript-file-extensions": "Intrarea conține extensii de fișiere JavaScript",
  },

  // Operații asincrone
  async: {
    "operation-timed-out": "Operația a expirat",
    "custom-timeout": "Timeout personalizat",
    "original-error": "Eroare originală",
    "first-failure": "Prima eșec",
    "second-failure": "Al doilea eșec",
    "persistent-failure": "Eșec persistent",
    "function-failed": "Funcția a eșuat",
    "mapper-failed": "Mapper-ul a eșuat",
    "concurrency-must-be-greater-than-0": "Concurrența trebuie să fie mai mare decât 0",
    "polling-timeout-reached": "Timeout-ul de polling a fost atins",
  },

  // Încărcarea modulelor
  module: {
    "is-null": "Modulul este null",
    "invalid-structure": "Structură de modul invalidă",
    "load-failed": "Încărcarea a eșuat",
    "loading-failed": "Încărcarea a eșuat",
  },

  // Stocarea și serializarea
  storage: {
    "potentially-dangerous-json-detected": "JSON potențial periculos detectat",
    "failed-to-parse-json-from-localstorage": "Nu s-a putut analiza JSON din localStorage:",
    "error-parsing-storage-event": "Eroare la analizarea evenimentului de stocare pentru cheie",
  },

  // Test și dezvoltare
  test: {
    error: "Eroare de test",
    message: "Mesaj de test",
    notification: "Notificare de test",
    "notification-1": "Notificare de test 1",
    "notification-2": "Notificare de test 2",
  },

  // Erori generale
  errors: {
    "string-error": "Eroare de string",
    "crypto-error": "Eroare criptografică",
    "some-error": "O eroare",
  },

  // Formatoare și utilitare
  formatters: {
    "hello-world": "Salut lume",
  },

  // Data și ora
  dateTime: {
    now: "Acum",
    today: "Astăzi",
    yesterday: "Ieri",
    tomorrow: "Mâine",
    format: "Format",
    timezone: "Fus orar",
  },

  // Teste de integrare
  integration: {
    "session-and-api-key-generation": "Generarea sesiunii și cheii API",
    "authentication-and-input-validation-integration": "Integrarea autentificării și validării intrării",
    "performance-and-security-integration": "Integrarea performanței și securității",
  },
};
