/**
 * Validation utilities for the Reynard Auth system.
 *
 * This module contains validation functions for user inputs,
 * email addresses, usernames, and other authentication data.
 */
import type { ValidationRules, PasswordStrength } from "../types";
/**
 * Validate email address format
 */
export declare function validateEmail(email: string): boolean;
/**
 * Validate username format
 */
export declare function validateUsername(username: string): boolean;
/**
 * Validate password strength
 */
export declare function validatePassword(password: string, rules?: ValidationRules): PasswordStrength;
//# sourceMappingURL=validation-utils.d.ts.map