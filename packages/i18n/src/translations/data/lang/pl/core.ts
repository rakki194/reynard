/**
 * Podstawowe polskie tłumaczenia dla frameworka Reynard
 */
export const coreTranslations = {
  // Błędy połączenia i API
  connection: {
    failed: "Połączenie nie powiodło się",
  },

  network: {
    error: "Błąd sieci",
  },

  request: {
    aborted: "Żądanie przerwane",
  },

  // Uwierzytelnianie i bezpieczeństwo
  bearer: {
    token: "Token Bearer",
    "test-key": "Klucz testowy Bearer",
    "new-key": "Nowy klucz Bearer",
  },

  // Powiadomienia
  notifications: {
    title: "Powiadomienia",
    dismiss: "Odrzuć",
    dismissAll: "Odrzuć wszystkie",
    markAsRead: "Oznacz jako przeczytane",
    markAllAsRead: "Oznacz wszystkie jako przeczytane",
    noNotifications: "Brak powiadomień",
    error: "Błąd",
    success: "Sukces",
    warning: "Ostrzeżenie",
    info: "Informacja",
    test: "Powiadomienie testowe",
    "test-1": "Powiadomienie testowe 1",
    "test-2": "Powiadomienie testowe 2",
    first: "Pierwsze powiadomienie",
    second: "Drugie powiadomienie",
    message: "Wiadomość testowa",
    "default-message": "Wiadomość domyślna",
    "first-message": "Pierwsza wiadomość",
    "second-message": "Druga wiadomość",
    "auto-dismiss": "Automatyczne odrzucanie",
    "error-message": "Wiadomość błędu",
    "no-group-message": "Wiadomość bez grupy",
    "upload-progress": "Postęp przesyłania",
    "progress-test": "Test postępu",
    "progress-test-2": "Test postępu 2",
    "custom-duration": "Niestandardowy czas trwania",
    "group-message": "Wiadomość grupy",
    "regular-message": "Zwykła wiadomość",
    "created-notification": "Utworzone powiadomienie",
    "first-grouped": "Pierwsze pogrupowane",
    "second-grouped": "Drugie pogrupowane",
  },

  // Komunikaty walidacji
  validation: {
    required: "To pole jest wymagane",
    invalid: "Nieprawidłowa wartość",
    tooShort: "Wartość jest za krótka",
    tooLong: "Wartość jest za długa",
    invalidEmail: "Nieprawidłowy adres e-mail",
    invalidUrl: "Nieprawidłowy URL",
    invalidNumber: "Nieprawidłowy numer",
    minValue: "Wartość jest za mała",
    maxValue: "Wartość jest za duża",
    "invalid-input-type": "Nieprawidłowy typ wejścia",
    "does-not-match-pattern": "Wejście nie pasuje do wymaganego wzorca",
  },

  // Walidacja hasła
  password: {
    "must-be-at-least-8-characters-long": "Hasło musi mieć co najmniej 8 znaków",
    "must-contain-at-least-one-uppercase-letter": "Hasło musi zawierać co najmniej jedną wielką literę",
    "must-contain-at-least-one-lowercase-letter": "Hasło musi zawierać co najmniej jedną małą literę",
    "must-contain-at-least-one-number": "Hasło musi zawierać co najmniej jedną cyfrę",
    "must-contain-at-least-one-special-character": "Hasło musi zawierać co najmniej jeden znak specjalny",
  },

  // Walidacja bezpieczeństwa
  security: {
    "at-least-one-character-type-must-be-included": "Musi być uwzględniony co najmniej jeden typ znaku",
    "input-contains-potentially-dangerous-html": "Wejście zawiera potencjalnie niebezpieczny HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Wejście zawiera potencjalnie niebezpieczne wzorce SQL",
    "input-contains-potentially-dangerous-xss-patterns": "Wejście zawiera potencjalnie niebezpieczne wzorce XSS",
    "input-contains-path-traversal-patterns": "Wejście zawiera wzorce przechodzenia ścieżki",
    "input-contains-windows-reserved-names": "Wejście zawiera zarezerwowane nazwy Windows",
    "input-contains-executable-file-extensions": "Wejście zawiera rozszerzenia plików wykonywalnych",
    "input-contains-null-bytes": "Wejście zawiera bajty null",
    "input-contains-hidden-files": "Wejście zawiera ukryte pliki",
    "input-contains-javascript-file-extensions": "Wejście zawiera rozszerzenia plików JavaScript",
  },

  // Operacje asynchroniczne
  async: {
    "operation-timed-out": "Operacja przekroczyła limit czasu",
    "custom-timeout": "Niestandardowy limit czasu",
    "original-error": "Oryginalny błąd",
    "first-failure": "Pierwsza awaria",
    "second-failure": "Druga awaria",
    "persistent-failure": "Trwała awaria",
    "function-failed": "Funkcja nie powiodła się",
    "mapper-failed": "Mapper nie powiódł się",
    "concurrency-must-be-greater-than-0": "Współbieżność musi być większa niż 0",
    "polling-timeout-reached": "Osiągnięto limit czasu sondowania",
  },

  // Ładowanie modułów
  module: {
    "is-null": "Moduł jest null",
    "invalid-structure": "Nieprawidłowa struktura modułu",
    "load-failed": "Ładowanie nie powiodło się",
    "loading-failed": "Ładowanie nie powiodło się",
  },

  // Przechowywanie i serializacja
  storage: {
    "potentially-dangerous-json-detected": "Wykryto potencjalnie niebezpieczny JSON",
    "failed-to-parse-json-from-localstorage": "Nie udało się sparsować JSON z localStorage:",
    "error-parsing-storage-event": "Błąd parsowania zdarzenia przechowywania dla klucza",
  },

  // Test i rozwój
  test: {
    error: "Błąd testu",
    message: "Wiadomość testowa",
    notification: "Powiadomienie testowe",
    "notification-1": "Powiadomienie testowe 1",
    "notification-2": "Powiadomienie testowe 2",
  },

  // Ogólne błędy
  errors: {
    "string-error": "Błąd ciągu",
    "crypto-error": "Błąd kryptograficzny",
    "some-error": "Jakiś błąd",
  },

  // Formatowanie i narzędzia
  formatters: {
    "hello-world": "Witaj świecie",
  },

  // Data i czas
  dateTime: {
    now: "Teraz",
    today: "Dzisiaj",
    yesterday: "Wczoraj",
    tomorrow: "Jutro",
    format: "Format",
    timezone: "Strefa czasowa",
  },

  // Testy integracyjne
  integration: {
    "session-and-api-key-generation": "Generowanie sesji i klucza API",
    "authentication-and-input-validation-integration": "Integracja uwierzytelniania i walidacji wejścia",
    "performance-and-security-integration": "Integracja wydajności i bezpieczeństwa",
  },
};
