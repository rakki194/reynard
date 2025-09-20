/**
 * Grundlegende deutsche Übersetzungen für Reynard Framework
 */
export const coreTranslations = {
  // Verbindungs- und API-Fehler
  connection: {
    failed: "Verbindung fehlgeschlagen",
  },

  network: {
    error: "Netzwerkfehler",
  },

  request: {
    aborted: "Anfrage abgebrochen",
  },

  // Authentifizierung und Sicherheit
  bearer: {
    token: "Bearer Token",
    "test-key": "Bearer Test-Schlüssel",
    "new-key": "Bearer neuer Schlüssel",
  },

  // Benachrichtigungen
  notifications: {
    title: "Benachrichtigungen",
    dismiss: "Verwerfen",
    dismissAll: "Alle verwerfen",
    markAsRead: "Als gelesen markieren",
    markAllAsRead: "Alle als gelesen markieren",
    noNotifications: "Keine Benachrichtigungen",
    error: "Fehler",
    success: "Erfolg",
    warning: "Warnung",
    info: "Information",
    test: "Test-Benachrichtigung",
    "test-1": "Test-Benachrichtigung 1",
    "test-2": "Test-Benachrichtigung 2",
    first: "Erste Benachrichtigung",
    second: "Zweite Benachrichtigung",
    message: "Test-Nachricht",
    "default-message": "Standard-Nachricht",
    "first-message": "Erste Nachricht",
    "second-message": "Zweite Nachricht",
    "auto-dismiss": "Automatisch verwerfen",
    "error-message": "Fehlermeldung",
    "no-group-message": "Keine Gruppen-Nachricht",
    "upload-progress": "Upload-Fortschritt",
    "progress-test": "Fortschritts-Test",
    "progress-test-2": "Fortschritts-Test 2",
    "custom-duration": "Benutzerdefinierte Dauer",
    "group-message": "Gruppen-Nachricht",
    "regular-message": "Normale Nachricht",
    "created-notification": "Erstellte Benachrichtigung",
    "first-grouped": "Erste gruppierte",
    "second-grouped": "Zweite gruppierte",
  },

  // Validierungsnachrichten
  validation: {
    required: "Dieses Feld ist erforderlich",
    invalid: "Ungültiger Wert",
    tooShort: "Wert ist zu kurz",
    tooLong: "Wert ist zu lang",
    invalidEmail: "Ungültige E-Mail-Adresse",
    invalidUrl: "Ungültige URL",
    invalidNumber: "Ungültige Nummer",
    minValue: "Wert ist zu klein",
    maxValue: "Wert ist zu groß",
    "invalid-input-type": "Ungültiger Eingabetyp",
    "does-not-match-pattern": "Eingabe entspricht nicht dem erforderlichen Muster",
  },

  // Passwort-Validierung
  password: {
    "must-be-at-least-8-characters-long": "Passwort muss mindestens 8 Zeichen lang sein",
    "must-contain-at-least-one-uppercase-letter": "Passwort muss mindestens einen Großbuchstaben enthalten",
    "must-contain-at-least-one-lowercase-letter": "Passwort muss mindestens einen Kleinbuchstaben enthalten",
    "must-contain-at-least-one-number": "Passwort muss mindestens eine Zahl enthalten",
    "must-contain-at-least-one-special-character": "Passwort muss mindestens ein Sonderzeichen enthalten",
  },

  // Sicherheitsvalidierung
  security: {
    "at-least-one-character-type-must-be-included": "Mindestens ein Zeichentyp muss enthalten sein",
    "input-contains-potentially-dangerous-html": "Eingabe enthält potentiell gefährliches HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Eingabe enthält potentiell gefährliche SQL-Muster",
    "input-contains-potentially-dangerous-xss-patterns": "Eingabe enthält potentiell gefährliche XSS-Muster",
    "input-contains-path-traversal-patterns": "Eingabe enthält Pfad-Traversal-Muster",
    "input-contains-windows-reserved-names": "Eingabe enthält Windows-reservierte Namen",
    "input-contains-executable-file-extensions": "Eingabe enthält ausführbare Dateierweiterungen",
    "input-contains-null-bytes": "Eingabe enthält Null-Bytes",
    "input-contains-hidden-files": "Eingabe enthält versteckte Dateien",
    "input-contains-javascript-file-extensions": "Eingabe enthält JavaScript-Dateierweiterungen",
  },

  // Asynchrone Operationen
  async: {
    "operation-timed-out": "Operation ist abgelaufen",
    "custom-timeout": "Benutzerdefinierter Timeout",
    "original-error": "Ursprünglicher Fehler",
    "first-failure": "Erster Fehler",
    "second-failure": "Zweiter Fehler",
    "persistent-failure": "Anhaltender Fehler",
    "function-failed": "Funktion fehlgeschlagen",
    "mapper-failed": "Mapper fehlgeschlagen",
    "concurrency-must-be-greater-than-0": "Parallelität muss größer als 0 sein",
    "polling-timeout-reached": "Polling-Timeout erreicht",
  },

  // Modulladung
  module: {
    "is-null": "Modul ist null",
    "invalid-structure": "Ungültige Modulstruktur",
    "load-failed": "Laden fehlgeschlagen",
    "loading-failed": "Laden fehlgeschlagen",
  },

  // Speicherung und Serialisierung
  storage: {
    "potentially-dangerous-json-detected": "Potentiell gefährliches JSON erkannt",
    "failed-to-parse-json-from-localstorage": "JSON aus localStorage konnte nicht geparst werden:",
    "error-parsing-storage-event": "Fehler beim Parsen des Speicher-Events für Schlüssel",
  },

  // Test und Entwicklung
  test: {
    error: "Test-Fehler",
    message: "Test-Nachricht",
    notification: "Test-Benachrichtigung",
    "notification-1": "Test-Benachrichtigung 1",
    "notification-2": "Test-Benachrichtigung 2",
  },

  // Allgemeine Fehler
  errors: {
    "string-error": "String-Fehler",
    "crypto-error": "Krypto-Fehler",
    "some-error": "Irgendein Fehler",
  },

  // Formatierer und Utilities
  formatters: {
    "hello-world": "Hallo Welt",
  },

  // Datum und Zeit
  dateTime: {
    now: "Jetzt",
    today: "Heute",
    yesterday: "Gestern",
    tomorrow: "Morgen",
    format: "Format",
    timezone: "Zeitzone",
  },

  // Integrationstests
  integration: {
    "session-and-api-key-generation": "Session- und API-Schlüssel-Generierung",
    "authentication-and-input-validation-integration": "Authentifizierungs- und Eingabevalidierungs-Integration",
    "performance-and-security-integration": "Leistungs- und Sicherheitsintegration",
  },
};
