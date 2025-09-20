/**
 * Core English translations for Reynard framework
 */
export const coreTranslations = {
  // Connection and API errors
  connection: {
    failed: "Connection failed",
  },

  network: {
    error: "Network error",
  },

  request: {
    aborted: "Request aborted",
  },

  // Authentication and security
  bearer: {
    token: "Bearer token",
    "test-key": "Bearer test-key",
    "new-key": "Bearer new-key",
  },

  // Notifications
  notifications: {
    title: "Notifications",
    dismiss: "Dismiss",
    dismissAll: "Dismiss All",
    markAsRead: "Mark as Read",
    markAllAsRead: "Mark All as Read",
    noNotifications: "No notifications",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    test: "Test notification",
    "test-1": "Test notification 1",
    "test-2": "Test notification 2",
    first: "First notification",
    second: "Second notification",
    message: "Test message",
    "default-message": "Default message",
    "first-message": "First message",
    "second-message": "Second message",
    "auto-dismiss": "Auto dismiss",
    "error-message": "Error message",
    "no-group-message": "No group message",
    "upload-progress": "Upload progress",
    "progress-test": "Progress test",
    "progress-test-2": "Progress test 2",
    "custom-duration": "Custom duration",
    "group-message": "Group message",
    "regular-message": "Regular message",
    "created-notification": "Created notification",
    "first-grouped": "First grouped",
    "second-grouped": "Second grouped",
  },

  // Validation messages
  validation: {
    required: "This field is required",
    invalid: "Invalid value",
    tooShort: "Value is too short",
    tooLong: "Value is too long",
    invalidEmail: "Invalid email address",
    invalidUrl: "Invalid URL",
    invalidNumber: "Invalid number",
    minValue: "Value is too small",
    maxValue: "Value is too large",
    "invalid-input-type": "Invalid input type",
    "does-not-match-pattern": "Input does not match required pattern",
  },

  // Password validation
  password: {
    "must-be-at-least-8-characters-long": "Password must be at least 8 characters long",
    "must-contain-at-least-one-uppercase-letter": "Password must contain at least one uppercase letter",
    "must-contain-at-least-one-lowercase-letter": "Password must contain at least one lowercase letter",
    "must-contain-at-least-one-number": "Password must contain at least one number",
    "must-contain-at-least-one-special-character": "Password must contain at least one special character",
  },

  // Security validation
  security: {
    "at-least-one-character-type-must-be-included": "At least one character type must be included",
    "input-contains-potentially-dangerous-html": "Input contains potentially dangerous HTML",
    "input-contains-potentially-dangerous-sql-patterns": "Input contains potentially dangerous SQL patterns",
    "input-contains-potentially-dangerous-xss-patterns": "Input contains potentially dangerous XSS patterns",
    "input-contains-path-traversal-patterns": "Input contains path traversal patterns",
    "input-contains-windows-reserved-names": "Input contains Windows reserved names",
    "input-contains-executable-file-extensions": "Input contains executable file extensions",
    "input-contains-null-bytes": "Input contains null bytes",
    "input-contains-hidden-files": "Input contains hidden files",
    "input-contains-javascript-file-extensions": "Input contains JavaScript file extensions",
  },

  // Async operations
  async: {
    "operation-timed-out": "Operation timed out",
    "custom-timeout": "Custom timeout",
    "original-error": "Original error",
    "first-failure": "First failure",
    "second-failure": "Second failure",
    "persistent-failure": "Persistent failure",
    "function-failed": "Function failed",
    "mapper-failed": "Mapper failed",
    "concurrency-must-be-greater-than-0": "Concurrency must be greater than 0",
    "polling-timeout-reached": "Polling timeout reached",
  },

  // Module loading
  module: {
    "is-null": "Module is null",
    "invalid-structure": "Invalid module structure",
    "load-failed": "Load failed",
    "loading-failed": "Loading failed",
  },

  // Storage and serialization
  storage: {
    "potentially-dangerous-json-detected": "Potentially dangerous JSON detected",
    "failed-to-parse-json-from-localstorage": "Failed to parse JSON from localStorage:",
    "error-parsing-storage-event": "Error parsing storage event for key",
  },

  // Test and development
  test: {
    error: "Test error",
    message: "Test message",
    notification: "Test notification",
    "notification-1": "Test notification 1",
    "notification-2": "Test notification 2",
  },

  // General errors
  errors: {
    "string-error": "String error",
    "crypto-error": "Crypto error",
    "some-error": "Some error",
    generic: "An error occurred",
    network: "Network error",
    validation: "Validation error",
    permission: "Permission denied",
    notFound: "Not found",
    mediaQueryNotSupported: "matchMedia not supported",
    loadFailed: "Failed to load module",
    dangerousJson: "Potentially dangerous JSON detected - contains prototype pollution patterns",
    parseJsonFailed: "Failed to parse JSON from localStorage:",
    moduleIsNull: "Module is null",
    invalidModuleStructure: "Invalid module structure",
    exportValidationFailed: "Export validation failed for {package}: {errors}",
  },

  // Formatters and utilities
  formatters: {
    "hello-world": "Hello world",
  },

  // Core utilities
  utilities: {
    format: "Format",
    parse: "Parse",
    validate: "Validate",
    transform: "Transform",
    convert: "Convert",
  },

  // Constants
  constants: {
    version: "Version",
    build: "Build",
    environment: "Environment",
    debug: "Debug",
    production: "Production",
  },

  // Helpers
  helpers: {
    date: "Date Helper",
    string: "String Helper",
    number: "Number Helper",
    array: "Array Helper",
    object: "Object Helper",
  },

  // Date and time
  dateTime: {
    now: "Now",
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    format: "Format",
    timezone: "Timezone",
  },

  // Integration tests
  integration: {
    "session-and-api-key-generation": "Session and API Key Generation",
    "authentication-and-input-validation-integration": "Authentication and Input Validation Integration",
    "performance-and-security-integration": "Performance and Security Integration",
  },

  // Language detection
  languageDetection: {
    plainText: "Plain Text",
    shell: "Shell",
  },

  // File types
  fileTypes: {
    packageJson: "Package.json",
    dockerfile: "Dockerfile",
    requirementsTxt: "Requirements.txt",
    yarnLock: "Yarn.lock",
    packageLockJson: "Package-lock.json",
  },

  // Language categories
  categories: {
    config: "Config",
    code: "Code",
    data: "Data",
    documentation: "Documentation",
    markup: "Markup",
    style: "Style",
    script: "Script",
  },
};
