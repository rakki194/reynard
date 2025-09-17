/**
 * Основни български преводи за рамката Reynard
 */
export const coreTranslations = {
  // Грешки при връзка и API
  connection: {
    failed: "Връзката неуспешна",
  },

  network: {
    error: "Мрежова грешка",
  },

  request: {
    aborted: "Заявката е прекратена",
  },

  // Удостоверяване и сигурност
  bearer: {
    token: "Bearer токен",
    "test-key": "Bearer тестов ключ",
    "new-key": "Bearer нов ключ",
  },

  // Известия
  notifications: {
    title: "Известия",
    dismiss: "Отхвърли",
    dismissAll: "Отхвърли всички",
    markAsRead: "Маркирай като прочетено",
    markAllAsRead: "Маркирай всички като прочетени",
    noNotifications: "Няма известия",
    error: "Грешка",
    success: "Успех",
    warning: "Предупреждение",
    info: "Информация",
    test: "Тестово известие",
    "test-1": "Тестово известие 1",
    "test-2": "Тестово известие 2",
    first: "Първо известие",
    second: "Второ известие",
    message: "Тестово съобщение",
    "default-message": "Съобщение по подразбиране",
    "first-message": "Първо съобщение",
    "second-message": "Второ съобщение",
    "auto-dismiss": "Автоматично отхвърляне",
    "error-message": "Съобщение за грешка",
    "no-group-message": "Съобщение без група",
    "upload-progress": "Прогрес на качването",
    "progress-test": "Тест на прогреса",
    "progress-test-2": "Тест на прогреса 2",
    "custom-duration": "Персонализирана продължителност",
    "group-message": "Съобщение на групата",
    "regular-message": "Обикновено съобщение",
    "created-notification": "Създадено известие",
    "first-grouped": "Първо групирано",
    "second-grouped": "Второ групирано",
  },

  // Съобщения за валидация
  validation: {
    required: "Това поле е задължително",
    invalid: "Невалидна стойност",
    tooShort: "Стойността е твърде къса",
    tooLong: "Стойността е твърде дълга",
    invalidEmail: "Невалиден имейл адрес",
    invalidUrl: "Невалиден URL",
    invalidNumber: "Невалиден номер",
    minValue: "Стойността е твърде малка",
    maxValue: "Стойността е твърде голяма",
    "invalid-input-type": "Невалиден тип вход",
    "does-not-match-pattern": "Входът не съответства на изисквания шаблон",
  },

  // Валидация на парола
  password: {
    "must-be-at-least-8-characters-long": "Паролата трябва да бъде поне 8 символа",
    "must-contain-at-least-one-uppercase-letter": "Паролата трябва да съдържа поне една главна буква",
    "must-contain-at-least-one-lowercase-letter": "Паролата трябва да съдържа поне една малка буква",
    "must-contain-at-least-one-number": "Паролата трябва да съдържа поне едно число",
    "must-contain-at-least-one-special-character": "Паролата трябва да съдържа поне един специален символ",
  },

  // Валидация на сигурност
  security: {
    "at-least-one-character-type-must-be-included": "Трябва да бъде включен поне един тип символ",
    "input-contains-potentially-dangerous-html": "Входът съдържа потенциално опасен HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Входът съдържа потенциално опасни SQL шаблони",
    "input-contains-potentially-dangerous-xss-patterns": "Входът съдържа потенциално опасни XSS шаблони",
    "input-contains-path-traversal-patterns": "Входът съдържа шаблони за обхождане на пътя",
    "input-contains-windows-reserved-names": "Входът съдържа запазени имена на Windows",
    "input-contains-executable-file-extensions": "Входът съдържа разширения на изпълними файлове",
    "input-contains-null-bytes": "Входът съдържа нулеви байтове",
    "input-contains-hidden-files": "Входът съдържа скрити файлове",
    "input-contains-javascript-file-extensions": "Входът съдържа разширения на JavaScript файлове",
  },

  // Асинхронни операции
  async: {
    "operation-timed-out": "Операцията изтече",
    "custom-timeout": "Персонализиран таймаут",
    "original-error": "Оригинална грешка",
    "first-failure": "Първи неуспех",
    "second-failure": "Втори неуспех",
    "persistent-failure": "Постоянен неуспех",
    "function-failed": "Функцията неуспешна",
    "mapper-failed": "Мапърът неуспешен",
    "concurrency-must-be-greater-than-0": "Паралелизмът трябва да бъде по-голям от 0",
    "polling-timeout-reached": "Достигнат таймаут на опитите",
  },

  // Зареждане на модули
  module: {
    "is-null": "Модулът е null",
    "invalid-structure": "Невалидна структура на модула",
    "load-failed": "Зареждането неуспешно",
    "loading-failed": "Зареждането неуспешно",
  },

  // Съхранение и сериализация
  storage: {
    "potentially-dangerous-json-detected": "Открит потенциално опасен JSON",
    "failed-to-parse-json-from-localstorage": "Неуспешно парсиране на JSON от localStorage:",
    "error-parsing-storage-event": "Грешка при парсиране на събитие за съхранение за ключ",
  },

  // Тест и разработка
  test: {
    error: "Тестова грешка",
    message: "Тестово съобщение",
    notification: "Тестово известие",
    "notification-1": "Тестово известие 1",
    "notification-2": "Тестово известие 2",
  },

  // Общи грешки
  errors: {
    "string-error": "Грешка в низ",
    "crypto-error": "Криптографска грешка",
    "some-error": "Някаква грешка",
  },

  // Форматиращи и утилити
  formatters: {
    "hello-world": "Здравей свят",
  },

  // Дата и време
  dateTime: {
    now: "Сега",
    today: "Днес",
    yesterday: "Вчера",
    tomorrow: "Утре",
    format: "Формат",
    timezone: "Часова зона",
  },

  // Интеграционни тестове
  integration: {
    "session-and-api-key-generation": "Генериране на сесия и API ключ",
    "authentication-and-input-validation-integration": "Интеграция на удостоверяване и валидация на вход",
    "performance-and-security-integration": "Интеграция на производителност и сигурност",
  },
};
