/**
 * API Client Package Translations
 * Translations for the Reynard API client system
 */

export const apiClientTranslations = {
  // Error messages
  errors: {
    apiError: "API Error",
    unknownError: "Unknown error",
    anApiErrorOccurred: "An API error occurred",
    responseReturnedErrorCode: "Response returned an error code",
    requestFailed: "The request failed and the interceptors did not return an alternative response",
  },

  // Error types
  errorTypes: {
    responseError: "ResponseError",
    fetchError: "FetchError",
    requiredError: "RequiredError",
    reynardApiError: "ReynardApiError",
  },

  // Status messages
  status: {
    loading: "Loading...",
    success: "Success",
    failed: "Failed",
    retrying: "Retrying...",
  },

  // API operations
  operations: {
    authenticate: "Authenticate",
    authorize: "Authorize",
    fetch: "Fetch",
    post: "Post",
    put: "Put",
    delete: "Delete",
    patch: "Patch",
  },
} as const;

export default apiClientTranslations;
