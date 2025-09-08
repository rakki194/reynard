/**
 * Password utilities for the Reynard Auth system.
 *
 * This module contains password-related utility functions including
 * strength calculation and validation.
 */
/**
 * Calculate basic password strength
 */
export function calculatePasswordStrength(password) {
    const errors = [];
    let score = 0;
    // Length check
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    else if (password.length >= 8) {
        score += 1;
    }
    // Uppercase check
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    else if (/[A-Z]/.test(password)) {
        score += 1;
    }
    // Lowercase check
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    else if (/[a-z]/.test(password)) {
        score += 1;
    }
    // Number check
    if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    else if (/\d/.test(password)) {
        score += 1;
    }
    // Special character check
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }
    else if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        score += 1;
    }
    // Determine strength level
    let strength;
    if (score <= 2)
        strength = "weak";
    else if (score <= 3)
        strength = "medium";
    else if (score <= 4)
        strength = "strong";
    else
        strength = "very-strong";
    return {
        isValid: errors.length === 0,
        score,
        feedback: strength,
        suggestions: errors,
    };
}
/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                throw lastError;
            }
            // Exponential backoff with jitter
            const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
