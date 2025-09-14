/**
 * Validation Utilities Index
 * Re-exports all validation utilities
 */

// Basic validation utilities
export {
  isValidUsername,
  isValidHexColor,
  isValidIPAddress,
  isInRange,
  isValidLength,
  isRequired,
} from "./basic";

// Security validation utilities (consolidated)
export {
  validateEmail as isValidEmail,
  isValidUrl,
  validatePhoneNumber as isValidPhoneNumber,
  validatePassword as validatePasswordStrength,
  type PasswordStrength,
} from "../../security/input-validation";

// File validation utilities (consolidated)
export {
  isValidFileType,
  isValidFileSize,
} from "../../security/file-validation";

// Financial validation utilities
export { isValidCreditCard, isValidPostalCode, isValidSSN } from "./financial";

// Date validation utilities
export { isValidDate, isValidAge } from "./date";
