/**
 * Authentication Header Utilities
 * Handles header construction for authenticated requests
 */

import type { AuthFetchOptions } from "./api-utils";
import { generateCSRFToken } from "./security-utils";

export interface HeaderConfig {
  token?: string;
  options: AuthFetchOptions;
}

/**
 * Builds headers for authenticated requests
 */
export const buildAuthHeaders = (
  config: HeaderConfig,
): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(config.options.headers as Record<string, string>),
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  // Add CSRF protection for state-changing requests
  const method = config.options.method?.toUpperCase() || "GET";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers["X-CSRF-Token"] = generateCSRFToken();
  }

  return headers;
};
