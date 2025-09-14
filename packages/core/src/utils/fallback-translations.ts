/**
 * Comprehensive fallback translations for all Reynard packages
 * Provides English fallbacks when i18n is not available
 */

export const FALLBACK_TRANSLATIONS: Record<string, string> = {
  // Core package translations
  "core.errors.moduleIsNull": "Module is null",
  "core.errors.invalidModuleStructure": "Invalid module structure",
  "core.errors.exportValidationFailed":
    "Export validation failed for {package}: {errors}",
  "core.errors.loadFailed": "Failed to load module",
  "core.errors.mediaQueryNotSupported": "matchMedia not supported",
  "core.errors.generic": "An error occurred",
  "core.errors.network": "Network error",
  "core.errors.validation": "Validation error",
  "core.errors.permission": "Permission denied",
  "core.errors.notFound": "Not found",
  "core.test.notification": "Test notification",
  "core.module.load-failed": "Failed to load module",
  "core.storage.potentially-dangerous-json-detected":
    "Potentially dangerous JSON detected",
  "core.storage.failed-to-parse-json-from-localstorage":
    "Failed to parse JSON from localStorage:",

  // Common translations
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.success": "Success",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.save": "Save",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.close": "Close",
  "common.open": "Open",
  "common.back": "Back",
  "common.next": "Next",
  "common.previous": "Previous",
  "common.submit": "Submit",
  "common.reset": "Reset",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.sort": "Sort",
  "common.refresh": "Refresh",
  "common.retry": "Retry",
  "common.yes": "Yes",
  "common.no": "No",
  "common.ok": "OK",

  // Theme translations
  "themes.light": "Light",
  "themes.dark": "Dark",
  "themes.gray": "Gray",
  "themes.banana": "Banana",
  "themes.strawberry": "Strawberry",
  "themes.peanut": "Peanut",
  "themes.high-contrast-black": "High Contrast Black",
  "themes.high-contrast-inverse": "High Contrast Inverse",
  "themes.system": "System",
  "themes.auto": "Auto",

  // Component translations
  "components.modal.title": "Modal",
  "components.button.submit": "Submit",
  "components.button.cancel": "Cancel",
  "components.input.placeholder": "Enter text...",
  "components.dropdown.select": "Select an option",
  "components.tooltip.default": "Tooltip",

  // File operations
  "files.upload": "Upload",
  "files.download": "Download",
  "files.delete": "Delete",
  "files.rename": "Rename",
  "files.copy": "Copy",
  "files.move": "Move",
  "files.create": "Create",
  "files.folder": "Folder",
  "files.file": "File",

  // Authentication
  "auth.login": "Login",
  "auth.logout": "Logout",
  "auth.register": "Register",
  "auth.username": "Username",
  "auth.password": "Password",
  "auth.email": "Email",
  "auth.forgotPassword": "Forgot Password",
  "auth.resetPassword": "Reset Password",

  // Chat/Messaging
  "chat.send": "Send",
  "chat.message": "Message",
  "chat.typing": "Typing...",
  "chat.online": "Online",
  "chat.offline": "Offline",
  "chat.room": "Room",
  "chat.join": "Join",
  "chat.leave": "Leave",

  // Date/Time
  "datetime.today": "Today",
  "datetime.yesterday": "Yesterday",
  "datetime.tomorrow": "Tomorrow",
  "datetime.now": "Now",
  "datetime.ago": "ago",
  "datetime.in": "in",

  // Numbers/Currency
  "number.zero": "0",
  "number.one": "1",
  "number.two": "2",
  "number.few": "few",
  "number.many": "many",
  "number.other": "other",

  // Monaco Editor
  "monaco.failedToLoadMonacoEditor": "Failed to load Monaco Editor",
  "monaco.failedToCreateMonacoEditor": "Failed to create Monaco Editor",
  "monaco.failedToCreateEditor": "Failed to create editor",

  // Charts package translations - moved to charts package i18n module
};
