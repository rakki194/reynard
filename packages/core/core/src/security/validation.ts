/**
 * Security Validation Utilities
 * Main validation module that re-exports specialized validation functions
 */

// Re-export file validation functions
export { validateFileName, validateFileExtension, validateFileSize, getSafeFilename } from "./file-validation.js";

// Re-export SQL validation functions
export { validateSQLInput, sanitizeSQLInput, validateSQLIdentifier, validateSQLParameter } from "./sql-validation.js";

// Re-export general input validation functions
export {
  sanitizeHTML,
  validateURL,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateInput,
} from "./input-validation.js";

// Re-export JSON validation functions
export { validateJSON, sanitizeJSON } from "./json-validation.js";

// Re-export XSS validation functions
export { validateXSSInput, sanitizeXSSInput, validateHTMLContent } from "./xss-validation.js";

// Re-export MIME validation functions
export {
  validateMimeType,
  getMimeTypeFromExtension,
  validateFileTypeByExtension,
  isSafeMimeType,
  getFileCategory,
} from "./mime-validation.js";

// Legacy exports for backward compatibility
export { validateFileName as validateFilename } from "./file-validation.js";
export { validateSQLInput as validateSQL } from "./sql-validation.js";
export { validateInput as validate } from "./input-validation.js";
