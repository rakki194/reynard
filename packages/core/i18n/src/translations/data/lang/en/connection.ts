/**
 * Connection and API translations
 */

export const connectionTranslations = {
  connection: {
    failed: "Connection failed",
  },
  network: {
    error: "Network error",
  },
  request: {
    aborted: "Request aborted",
  },

  // Validation error messages
  validation: {
    email: {
      invalid: "Must be a valid email address",
    },
    password: {
      requirements: "Password must be 8-128 characters with uppercase, lowercase, number, and special character",
    },
    username: {
      requirements: "Username must be 3-30 characters with only letters, numbers, underscores, and hyphens",
    },
    token: {
      requirements: "Token must be 20-512 characters",
    },
    filename: {
      invalidCharacters: "Filename cannot contain invalid characters",
    },
    mimeType: {
      invalid: "Must be a valid MIME type",
    },
    timeout: {
      range: "Timeout must be between 1 second and 5 minutes",
    },
    modelName: {
      requirements: "Model name must be 1-100 characters with only letters, numbers, dots, underscores, and hyphens",
    },
    prompt: {
      length: "Prompt must be 1-10000 characters",
    },
    theme: {
      invalid: "Theme must be light, dark, or auto",
    },
  },
};
