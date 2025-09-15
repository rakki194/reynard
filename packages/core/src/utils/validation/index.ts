/**
 * Validation Utilities Index
 * Re-exports all validation utilities from reynard-validation
 *
 * @deprecated Use reynard-validation package directly
 */

// Re-export from reynard-validation for backward compatibility
export {
  CommonSchemas,
  FormSchemas,
  ValidationUtils,
  validateApiKey,
  validateEmail,
  validatePassword,
  validatePasswordStrength,
  validateToken,
  validateUrl,
  validateUrlSecurity,
  validateUsername,
  type PasswordStrength,
  type ValidationResult,
  type ValidationRules,
} from "reynard-validation";

// Legacy exports for backward compatibility
export { isInRange, isRequired, isValidHexColor, isValidIPAddress, isValidLength, isValidUsername } from "./basic";

// Legacy security validation utilities (consolidated)
export {
  validateEmail as isValidEmail,
  validatePhoneNumber as isValidPhoneNumber,
  isValidUrl,
  validatePassword as validatePasswordStrength,
  type PasswordStrength,
} from "../../security/input-validation";

// File validation utilities (consolidated)
export { isValidFileSize, isValidFileType } from "../../security/file-validation";

// Financial validation utilities
export { isValidCreditCard, isValidPostalCode, isValidSSN } from "./financial";

// Date validation utilities
export { isValidAge, isValidDate } from "./date";
