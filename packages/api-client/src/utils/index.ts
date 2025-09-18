/**
 * Utility functions for Reynard API client
 */

import { useI18n } from "reynard-i18n";

export const createAuthFetch = (token: string) => {
  return async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };
};

export const handleApiError = (error: any, t?: (key: string) => string) => {
  const { t: i18nT } = useI18n();
  const translate = t || i18nT;

  console.error(translate("apiClient.errors.apiError"), error);
  throw new Error(error.message || translate("apiClient.errors.anApiErrorOccurred"));
};
