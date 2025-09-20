/**
 * API Utilities
 *
 * Common utilities for the NLWeb API.
 */

/**
 * Get CORS headers
 */
export function getCORSHeaders(enableCORS: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (enableCORS) {
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }

  return headers;
}
