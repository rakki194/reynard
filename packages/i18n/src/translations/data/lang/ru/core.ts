/**
 * Основные русские переводы для фреймворка Reynard
 */
export const coreTranslations = {
  // Ошибки подключения и API
  connection: {
    failed: "Подключение не удалось",
  },

  network: {
    error: "Ошибка сети",
  },

  request: {
    aborted: "Запрос прерван",
  },

  // Аутентификация и безопасность
  bearer: {
    token: "Bearer токен",
    "test-key": "Bearer тестовый ключ",
    "new-key": "Bearer новый ключ",
  },

  // Уведомления
  notifications: {
    title: "Уведомления",
    dismiss: "Отклонить",
    dismissAll: "Отклонить все",
    markAsRead: "Отметить как прочитанное",
    markAllAsRead: "Отметить все как прочитанные",
    noNotifications: "Нет уведомлений",
    error: "Ошибка",
    success: "Успех",
    warning: "Предупреждение",
    info: "Информация",
    test: "Тестовое уведомление",
    "test-1": "Тестовое уведомление 1",
    "test-2": "Тестовое уведомление 2",
    first: "Первое уведомление",
    second: "Второе уведомление",
    message: "Тестовое сообщение",
    "default-message": "Сообщение по умолчанию",
    "first-message": "Первое сообщение",
    "second-message": "Второе сообщение",
    "auto-dismiss": "Автоматическое отклонение",
    "error-message": "Сообщение об ошибке",
    "no-group-message": "Сообщение без группы",
    "upload-progress": "Прогресс загрузки",
    "progress-test": "Тест прогресса",
    "progress-test-2": "Тест прогресса 2",
    "custom-duration": "Пользовательская продолжительность",
    "group-message": "Сообщение группы",
    "regular-message": "Обычное сообщение",
    "created-notification": "Созданное уведомление",
    "first-grouped": "Первое сгруппированное",
    "second-grouped": "Второе сгруппированное",
  },

  // Сообщения валидации
  validation: {
    required: "Это поле обязательно",
    invalid: "Неверное значение",
    tooShort: "Значение слишком короткое",
    tooLong: "Значение слишком длинное",
    invalidEmail: "Неверный адрес электронной почты",
    invalidUrl: "Неверный URL",
    invalidNumber: "Неверный номер",
    minValue: "Значение слишком маленькое",
    maxValue: "Значение слишком большое",
    "invalid-input-type": "Неверный тип ввода",
    "does-not-match-pattern": "Ввод не соответствует требуемому шаблону",
  },

  // Валидация пароля
  password: {
    "must-be-at-least-8-characters-long": "Пароль должен содержать не менее 8 символов",
    "must-contain-at-least-one-uppercase-letter": "Пароль должен содержать хотя бы одну заглавную букву",
    "must-contain-at-least-one-lowercase-letter": "Пароль должен содержать хотя бы одну строчную букву",
    "must-contain-at-least-one-number": "Пароль должен содержать хотя бы одну цифру",
    "must-contain-at-least-one-special-character": "Пароль должен содержать хотя бы один специальный символ",
  },

  // Валидация безопасности
  security: {
    "at-least-one-character-type-must-be-included": "Должен быть включен хотя бы один тип символа",
    "input-contains-potentially-dangerous-html": "Ввод содержит потенциально опасный HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Ввод содержит потенциально опасные SQL-шаблоны",
    "input-contains-potentially-dangerous-xss-patterns": "Ввод содержит потенциально опасные XSS-шаблоны",
    "input-contains-path-traversal-patterns": "Ввод содержит шаблоны обхода пути",
    "input-contains-windows-reserved-names": "Ввод содержит зарезервированные имена Windows",
    "input-contains-executable-file-extensions": "Ввод содержит расширения исполняемых файлов",
    "input-contains-null-bytes": "Ввод содержит нулевые байты",
    "input-contains-hidden-files": "Ввод содержит скрытые файлы",
    "input-contains-javascript-file-extensions": "Ввод содержит расширения файлов JavaScript",
  },

  // Асинхронные операции
  async: {
    "operation-timed-out": "Операция превысила время ожидания",
    "custom-timeout": "Пользовательский таймаут",
    "original-error": "Исходная ошибка",
    "first-failure": "Первая неудача",
    "second-failure": "Вторая неудача",
    "persistent-failure": "Постоянная неудача",
    "function-failed": "Функция не удалась",
    "mapper-failed": "Маппер не удался",
    "concurrency-must-be-greater-than-0": "Параллелизм должен быть больше 0",
    "polling-timeout-reached": "Достигнут таймаут опроса",
  },

  // Загрузка модулей
  module: {
    "is-null": "Модуль равен null",
    "invalid-structure": "Неверная структура модуля",
    "load-failed": "Загрузка не удалась",
    "loading-failed": "Загрузка не удалась",
  },

  // Хранение и сериализация
  storage: {
    "potentially-dangerous-json-detected": "Обнаружен потенциально опасный JSON",
    "failed-to-parse-json-from-localstorage": "Не удалось разобрать JSON из localStorage:",
    "error-parsing-storage-event": "Ошибка разбора события хранения для ключа",
  },

  // Тест и разработка
  test: {
    error: "Ошибка теста",
    message: "Тестовое сообщение",
    notification: "Тестовое уведомление",
    "notification-1": "Тестовое уведомление 1",
    "notification-2": "Тестовое уведомление 2",
  },

  // Общие ошибки
  errors: {
    "string-error": "Ошибка строки",
    "crypto-error": "Ошибка шифрования",
    "some-error": "Какая-то ошибка",
  },

  // Форматтеры и утилиты
  formatters: {
    "hello-world": "Привет мир",
  },

  // Дата и время
  dateTime: {
    now: "Сейчас",
    today: "Сегодня",
    yesterday: "Вчера",
    tomorrow: "Завтра",
    format: "Формат",
    timezone: "Часовой пояс",
  },

  // Интеграционные тесты
  integration: {
    "session-and-api-key-generation": "Генерация сессии и API-ключа",
    "authentication-and-input-validation-integration": "Интеграция аутентификации и валидации ввода",
    "performance-and-security-integration": "Интеграция производительности и безопасности",
  },
};
