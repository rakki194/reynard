/**
 * HTML Input Validation Utilities
 * Functions for validating and sanitizing HTML content
 */

/**
 * Validate and sanitize HTML content
 */
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href=""')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
    .replace(/javascript:[^"'\s>]*/gi, "") // Remove standalone javascript: protocols
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed[^>]*>.*?<\/embed>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<form[^>]*>.*?<\/form>/gi, "")
    .replace(/<input[^>]*>/gi, "")
    .replace(/<button[^>]*>.*?<\/button>/gi, "")
    .replace(/<select[^>]*>.*?<\/select>/gi, "")
    .replace(/<textarea[^>]*>.*?<\/textarea>/gi, "")
    .replace(/<img[^>]*on\w+[^>]*>/gi, "")
    .replace(/\s+/g, " ") // Clean up extra whitespace
    .replace(/>\s+</g, "><") // Remove whitespace between tags
    .replace(/\s+>/g, ">") // Remove whitespace before closing tag
    .trim();
}
