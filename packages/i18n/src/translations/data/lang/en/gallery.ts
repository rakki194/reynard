/**
 * Gallery Package Translations
 * Translations for the Reynard Gallery system
 */

export const gallery = {
  // Time labels
  time: {
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "{count} days ago",
    weeksAgo: "{count} weeks ago",
    monthsAgo: "{count} months ago",
    yearsAgo: "{count} years ago",
  },

  // Navigation
  navigation: {
    home: "Home",
    back: "Back",
    next: "Next",
    previous: "Previous",
  },

  // File operations
  fileOperations: {
    upload: "Upload",
    download: "Download",
    delete: "Delete",
    rename: "Rename",
    move: "Move",
    copy: "Copy",
  },

  // Error messages
  errors: {
    networkErrorDuringUpload: "Network error during upload",
    uploadFailed: "Upload failed",
    fileNotFound: "File not found",
    accessDenied: "Access denied",
  },

  // Status messages
  status: {
    uploading: "Uploading...",
    processing: "Processing...",
    complete: "Complete",
    failed: "Failed",
  },
} as const;

export default gallery;
