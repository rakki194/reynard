/**
 * Traduzioni italiane di base per il framework Reynard
 */
export const coreTranslations = {
  // Errori di connessione e API
  connection: {
    failed: "Connessione fallita",
  },

  network: {
    error: "Errore di rete",
  },

  request: {
    aborted: "Richiesta annullata",
  },

  // Autenticazione e sicurezza
  bearer: {
    token: "Token Bearer",
    "test-key": "Chiave di test Bearer",
    "new-key": "Nuova chiave Bearer",
  },

  // Notifiche
  notifications: {
    title: "Notifiche",
    dismiss: "Scarta",
    dismissAll: "Scarta tutto",
    markAsRead: "Segna come letto",
    markAllAsRead: "Segna tutto come letto",
    noNotifications: "Nessuna notifica",
    error: "Errore",
    success: "Successo",
    warning: "Avviso",
    info: "Informazione",
    test: "Notifica di test",
    "test-1": "Notifica di test 1",
    "test-2": "Notifica di test 2",
    first: "Prima notifica",
    second: "Seconda notifica",
    message: "Messaggio di test",
    "default-message": "Messaggio predefinito",
    "first-message": "Primo messaggio",
    "second-message": "Secondo messaggio",
    "auto-dismiss": "Scarta automaticamente",
    "error-message": "Messaggio di errore",
    "no-group-message": "Messaggio senza gruppo",
    "upload-progress": "Progresso caricamento",
    "progress-test": "Test di progresso",
    "progress-test-2": "Test di progresso 2",
    "custom-duration": "Durata personalizzata",
    "group-message": "Messaggio di gruppo",
    "regular-message": "Messaggio regolare",
    "created-notification": "Notifica creata",
    "first-grouped": "Primo raggruppato",
    "second-grouped": "Secondo raggruppato",
  },

  // Messaggi di validazione
  validation: {
    required: "Questo campo è obbligatorio",
    invalid: "Valore non valido",
    tooShort: "Il valore è troppo corto",
    tooLong: "Il valore è troppo lungo",
    invalidEmail: "Indirizzo email non valido",
    invalidUrl: "URL non valido",
    invalidNumber: "Numero non valido",
    minValue: "Il valore è troppo piccolo",
    maxValue: "Il valore è troppo grande",
    "invalid-input-type": "Tipo di input non valido",
    "does-not-match-pattern": "L'input non corrisponde al pattern richiesto",
  },

  // Validazione password
  password: {
    "must-be-at-least-8-characters-long": "La password deve essere di almeno 8 caratteri",
    "must-contain-at-least-one-uppercase-letter": "La password deve contenere almeno una lettera maiuscola",
    "must-contain-at-least-one-lowercase-letter": "La password deve contenere almeno una lettera minuscola",
    "must-contain-at-least-one-number": "La password deve contenere almeno un numero",
    "must-contain-at-least-one-special-character": "La password deve contenere almeno un carattere speciale",
  },

  // Validazione sicurezza
  security: {
    "at-least-one-character-type-must-be-included": "Deve essere incluso almeno un tipo di carattere",
    "input-contains-potentially-dangerous-html": "L'input contiene HTML potenzialmente pericoloso",
    "input-contains-potentially-dangerous-sql-patterns": "L'input contiene pattern SQL potenzialmente pericolosi",
    "input-contains-potentially-dangerous-xss-patterns": "L'input contiene pattern XSS potenzialmente pericolosi",
    "input-contains-path-traversal-patterns": "L'input contiene pattern di attraversamento del percorso",
    "input-contains-windows-reserved-names": "L'input contiene nomi riservati di Windows",
    "input-contains-executable-file-extensions": "L'input contiene estensioni di file eseguibili",
    "input-contains-null-bytes": "L'input contiene byte null",
    "input-contains-hidden-files": "L'input contiene file nascosti",
    "input-contains-javascript-file-extensions": "L'input contiene estensioni di file JavaScript",
  },

  // Operazioni asincrone
  async: {
    "operation-timed-out": "L'operazione è scaduta",
    "custom-timeout": "Timeout personalizzato",
    "original-error": "Errore originale",
    "first-failure": "Primo fallimento",
    "second-failure": "Secondo fallimento",
    "persistent-failure": "Fallimento persistente",
    "function-failed": "La funzione è fallita",
    "mapper-failed": "Il mapper è fallito",
    "concurrency-must-be-greater-than-0": "La concorrenza deve essere maggiore di 0",
    "polling-timeout-reached": "Timeout di polling raggiunto",
  },

  // Caricamento moduli
  module: {
    "is-null": "Il modulo è null",
    "invalid-structure": "Struttura del modulo non valida",
    "load-failed": "Il caricamento è fallito",
    "loading-failed": "Il caricamento è fallito",
  },

  // Archiviazione e serializzazione
  storage: {
    "potentially-dangerous-json-detected": "JSON potenzialmente pericoloso rilevato",
    "failed-to-parse-json-from-localstorage": "Impossibile analizzare JSON da localStorage:",
    "error-parsing-storage-event": "Errore nell'analisi dell'evento di archiviazione per la chiave",
  },

  // Test e sviluppo
  test: {
    error: "Errore di test",
    message: "Messaggio di test",
    notification: "Notifica di test",
    "notification-1": "Notifica di test 1",
    "notification-2": "Notifica di test 2",
  },

  // Errori generali
  errors: {
    "string-error": "Errore di stringa",
    "crypto-error": "Errore crittografico",
    "some-error": "Qualche errore",
  },

  // Formattatori e utilità
  formatters: {
    "hello-world": "Ciao mondo",
  },

  // Data e ora
  dateTime: {
    now: "Ora",
    today: "Oggi",
    yesterday: "Ieri",
    tomorrow: "Domani",
    format: "Formato",
    timezone: "Fuso orario",
  },

  // Test di integrazione
  integration: {
    "session-and-api-key-generation": "Generazione sessione e chiave API",
    "authentication-and-input-validation-integration": "Integrazione autenticazione e validazione input",
    "performance-and-security-integration": "Integrazione prestazioni e sicurezza",
  },
};
