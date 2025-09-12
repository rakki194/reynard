/**
 * URL Input Validation Utilities
 * Functions for validating URLs and email addresses
 */

/**
 * Validate URL for security
 */
export function validateURL(url: string): {
  isValid: boolean;
  sanitized?: string;
} {
  if (!url || typeof url !== "string") {
    return { isValid: false };
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { isValid: false };
    }

    // Reject localhost and private IP addresses
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || 
        hostname === "127.0.0.1" || 
        hostname === "0.0.0.0" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172.")) {
      return { isValid: false };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /ftp:/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        return { isValid: false };
      }
    }

    // Add trailing slash if missing
    let sanitized = url;
    if (!sanitized.endsWith("/") && !sanitized.includes("?")) {
      sanitized += "/";
    }

    return { isValid: true, sanitized };
  } catch {
    return { isValid: false };
  }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== "string") {
    return false;
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // Check if it's a valid length (7-15 digits)
  return digits.length >= 7 && digits.length <= 15;
}
