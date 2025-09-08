/**
 * Password utilities for the Reynard Auth system.
 *
 * This module contains password-related utility functions including
 * strength calculation and validation.
 */
import type { PasswordStrength } from "../types";
/**
 * Calculate basic password strength
 */
export declare function calculatePasswordStrength(password: string): PasswordStrength;
/**
 * Retry function with exponential backoff
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
//# sourceMappingURL=password-utils.d.ts.map