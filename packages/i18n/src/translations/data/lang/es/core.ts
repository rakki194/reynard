/**
 * Traducciones básicas en español para el framework Reynard
 */
export const coreTranslations = {
  // Errores de conexión y API
  connection: {
    failed: "Conexión fallida",
  },

  network: {
    error: "Error de red",
  },

  request: {
    aborted: "Solicitud abortada",
  },

  // Autenticación y seguridad
  bearer: {
    token: "Token Bearer",
    "test-key": "Clave de prueba Bearer",
    "new-key": "Nueva clave Bearer",
  },

  // Notificaciones
  notifications: {
    title: "Notificaciones",
    dismiss: "Descartar",
    dismissAll: "Descartar todas",
    markAsRead: "Marcar como leído",
    markAllAsRead: "Marcar todas como leídas",
    noNotifications: "Sin notificaciones",
    error: "Error",
    success: "Éxito",
    warning: "Advertencia",
    info: "Información",
    test: "Notificación de prueba",
    "test-1": "Notificación de prueba 1",
    "test-2": "Notificación de prueba 2",
    first: "Primera notificación",
    second: "Segunda notificación",
    message: "Mensaje de prueba",
    "default-message": "Mensaje por defecto",
    "first-message": "Primer mensaje",
    "second-message": "Segundo mensaje",
    "auto-dismiss": "Descartar automáticamente",
    "error-message": "Mensaje de error",
    "no-group-message": "Mensaje sin grupo",
    "upload-progress": "Progreso de carga",
    "progress-test": "Prueba de progreso",
    "progress-test-2": "Prueba de progreso 2",
    "custom-duration": "Duración personalizada",
    "group-message": "Mensaje de grupo",
    "regular-message": "Mensaje regular",
    "created-notification": "Notificación creada",
    "first-grouped": "Primero agrupado",
    "second-grouped": "Segundo agrupado",
  },

  // Mensajes de validación
  validation: {
    required: "Este campo es requerido",
    invalid: "Valor inválido",
    tooShort: "El valor es muy corto",
    tooLong: "El valor es muy largo",
    invalidEmail: "Dirección de email inválida",
    invalidUrl: "URL inválida",
    invalidNumber: "Número inválido",
    minValue: "El valor es muy pequeño",
    maxValue: "El valor es muy grande",
    "invalid-input-type": "Tipo de entrada inválido",
    "does-not-match-pattern": "La entrada no coincide con el patrón requerido",
  },

  // Validación de contraseña
  password: {
    "must-be-at-least-8-characters-long": "La contraseña debe tener al menos 8 caracteres",
    "must-contain-at-least-one-uppercase-letter": "La contraseña debe contener al menos una letra mayúscula",
    "must-contain-at-least-one-lowercase-letter": "La contraseña debe contener al menos una letra minúscula",
    "must-contain-at-least-one-number": "La contraseña debe contener al menos un número",
    "must-contain-at-least-one-special-character": "La contraseña debe contener al menos un carácter especial",
  },

  // Validación de seguridad
  security: {
    "at-least-one-character-type-must-be-included": "Debe incluirse al menos un tipo de carácter",
    "input-contains-potentially-dangerous-html": "La entrada contiene HTML potencialmente peligroso",
    "input-contains-potentially-dangerous-sql-patterns": "La entrada contiene patrones SQL potencialmente peligrosos",
    "input-contains-potentially-dangerous-xss-patterns": "La entrada contiene patrones XSS potencialmente peligrosos",
    "input-contains-path-traversal-patterns": "La entrada contiene patrones de recorrido de ruta",
    "input-contains-windows-reserved-names": "La entrada contiene nombres reservados de Windows",
    "input-contains-executable-file-extensions": "La entrada contiene extensiones de archivos ejecutables",
    "input-contains-null-bytes": "La entrada contiene bytes nulos",
    "input-contains-hidden-files": "La entrada contiene archivos ocultos",
    "input-contains-javascript-file-extensions": "La entrada contiene extensiones de archivos JavaScript",
  },

  // Operaciones asíncronas
  async: {
    "operation-timed-out": "La operación expiró",
    "custom-timeout": "Timeout personalizado",
    "original-error": "Error original",
    "first-failure": "Primera falla",
    "second-failure": "Segunda falla",
    "persistent-failure": "Falla persistente",
    "function-failed": "La función falló",
    "mapper-failed": "El mapper falló",
    "concurrency-must-be-greater-than-0": "La concurrencia debe ser mayor que 0",
    "polling-timeout-reached": "Se alcanzó el timeout de polling",
  },

  // Carga de módulos
  module: {
    "is-null": "El módulo es null",
    "invalid-structure": "Estructura de módulo inválida",
    "load-failed": "La carga falló",
    "loading-failed": "La carga falló",
  },

  // Almacenamiento y serialización
  storage: {
    "potentially-dangerous-json-detected": "JSON potencialmente peligroso detectado",
    "failed-to-parse-json-from-localstorage": "Error al parsear JSON desde localStorage:",
    "error-parsing-storage-event": "Error al parsear evento de almacenamiento para clave",
  },

  // Prueba y desarrollo
  test: {
    error: "Error de prueba",
    message: "Mensaje de prueba",
    notification: "Notificación de prueba",
    "notification-1": "Notificación de prueba 1",
    "notification-2": "Notificación de prueba 2",
  },

  // Errores generales
  errors: {
    "string-error": "Error de cadena",
    "crypto-error": "Error criptográfico",
    "some-error": "Algún error",
  },

  // Formateadores y utilidades
  formatters: {
    "hello-world": "Hola mundo",
  },

  // Fecha y hora
  dateTime: {
    now: "Ahora",
    today: "Hoy",
    yesterday: "Ayer",
    tomorrow: "Mañana",
    format: "Formato",
    timezone: "Zona horaria",
  },

  // Pruebas de integración
  integration: {
    "session-and-api-key-generation": "Generación de sesión y clave API",
    "authentication-and-input-validation-integration": "Integración de autenticación y validación de entrada",
    "performance-and-security-integration": "Integración de rendimiento y seguridad",
  },
};
