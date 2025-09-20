/**
 * Основні українські переклади для фреймворку Reynard
 */
export const coreTranslations = {
  // Помилки підключення та API
  connection: {
    failed: "Підключення не вдалося",
  },

  network: {
    error: "Помилка мережі",
  },

  request: {
    aborted: "Запит перервано",
  },

  // Аутентифікація та безпека
  bearer: {
    token: "Bearer токен",
    "test-key": "Bearer тестовий ключ",
    "new-key": "Bearer новий ключ",
  },

  // Сповіщення
  notifications: {
    title: "Сповіщення",
    dismiss: "Відхилити",
    dismissAll: "Відхилити всі",
    markAsRead: "Позначити як прочитане",
    markAllAsRead: "Позначити всі як прочитані",
    noNotifications: "Немає сповіщень",
    error: "Помилка",
    success: "Успіх",
    warning: "Попередження",
    info: "Інформація",
    test: "Тестове сповіщення",
    "test-1": "Тестове сповіщення 1",
    "test-2": "Тестове сповіщення 2",
    first: "Перше сповіщення",
    second: "Друге сповіщення",
    message: "Тестове повідомлення",
    "default-message": "Повідомлення за замовчуванням",
    "first-message": "Перше повідомлення",
    "second-message": "Друге повідомлення",
    "auto-dismiss": "Автоматичне відхилення",
    "error-message": "Повідомлення про помилку",
    "no-group-message": "Повідомлення без групи",
    "upload-progress": "Прогрес завантаження",
    "progress-test": "Тест прогресу",
    "progress-test-2": "Тест прогресу 2",
    "custom-duration": "Користувацька тривалість",
    "group-message": "Повідомлення групи",
    "regular-message": "Звичайне повідомлення",
    "created-notification": "Створене сповіщення",
    "first-grouped": "Перше згруповане",
    "second-grouped": "Друге згруповане",
  },

  // Повідомлення валідації
  validation: {
    required: "Це поле обов'язкове",
    invalid: "Невірне значення",
    tooShort: "Значення занадто коротке",
    tooLong: "Значення занадто довге",
    invalidEmail: "Невірна адреса електронної пошти",
    invalidUrl: "Невірний URL",
    invalidNumber: "Невірний номер",
    minValue: "Значення занадто мале",
    maxValue: "Значення занадто велике",
    "invalid-input-type": "Невірний тип вводу",
    "does-not-match-pattern": "Ввід не відповідає необхідному шаблону",
  },

  // Валідація пароля
  password: {
    "must-be-at-least-8-characters-long": "Пароль повинен містити принаймні 8 символів",
    "must-contain-at-least-one-uppercase-letter": "Пароль повинен містити принаймні одну велику літеру",
    "must-contain-at-least-one-lowercase-letter": "Пароль повинен містити принаймні одну малу літеру",
    "must-contain-at-least-one-number": "Пароль повинен містити принаймні одну цифру",
    "must-contain-at-least-one-special-character": "Пароль повинен містити принаймні один спеціальний символ",
  },

  // Валідація безпеки
  security: {
    "at-least-one-character-type-must-be-included": "Повинен бути включений принаймні один тип символу",
    "input-contains-potentially-dangerous-html": "Ввід містить потенційно небезпечний HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Ввід містить потенційно небезпечні SQL-шаблони",
    "input-contains-potentially-dangerous-xss-patterns": "Ввід містить потенційно небезпечні XSS-шаблони",
    "input-contains-path-traversal-patterns": "Ввід містить шаблони обходу шляху",
    "input-contains-windows-reserved-names": "Ввід містить зарезервовані імена Windows",
    "input-contains-executable-file-extensions": "Ввід містить розширення виконуваних файлів",
    "input-contains-null-bytes": "Ввід містить нульові байти",
    "input-contains-hidden-files": "Ввід містить приховані файли",
    "input-contains-javascript-file-extensions": "Ввід містить розширення файлів JavaScript",
  },

  // Асинхронні операції
  async: {
    "operation-timed-out": "Операція перевищила час очікування",
    "custom-timeout": "Користувацький таймаут",
    "original-error": "Оригінальна помилка",
    "first-failure": "Перша невдача",
    "second-failure": "Друга невдача",
    "persistent-failure": "Постійна невдача",
    "function-failed": "Функція не вдалася",
    "mapper-failed": "Маппер не вдався",
    "concurrency-must-be-greater-than-0": "Паралелізм повинен бути більше 0",
    "polling-timeout-reached": "Досягнуто таймаут опитування",
  },

  // Завантаження модулів
  module: {
    "is-null": "Модуль дорівнює null",
    "invalid-structure": "Невірна структура модуля",
    "load-failed": "Завантаження не вдалося",
    "loading-failed": "Завантаження не вдалося",
  },

  // Зберігання та серіалізація
  storage: {
    "potentially-dangerous-json-detected": "Виявлено потенційно небезпечний JSON",
    "failed-to-parse-json-from-localstorage": "Не вдалося розібрати JSON з localStorage:",
    "error-parsing-storage-event": "Помилка розбору події зберігання для ключа",
  },

  // Тест та розробка
  test: {
    error: "Помилка тесту",
    message: "Тестове повідомлення",
    notification: "Тестове сповіщення",
    "notification-1": "Тестове сповіщення 1",
    "notification-2": "Тестове сповіщення 2",
  },

  // Загальні помилки
  errors: {
    "string-error": "Помилка рядка",
    "crypto-error": "Помилка шифрування",
    "some-error": "Якась помилка",
  },

  // Форматери та утиліти
  formatters: {
    "hello-world": "Привіт світ",
  },

  // Дата та час
  dateTime: {
    now: "Зараз",
    today: "Сьогодні",
    yesterday: "Вчора",
    tomorrow: "Завтра",
    format: "Формат",
    timezone: "Часовий пояс",
  },

  // Інтеграційні тести
  integration: {
    "session-and-api-key-generation": "Генерація сесії та API-ключа",
    "authentication-and-input-validation-integration": "Інтеграція аутентифікації та валідації вводу",
    "performance-and-security-integration": "Інтеграція продуктивності та безпеки",
  },
};
