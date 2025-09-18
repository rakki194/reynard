/**
 * Caption Package Translations
 * Translations for the Reynard Caption system
 */

export const captionTranslations = {
  // Error messages
  errors: {
    failedToProcessFile: "Failed to process file",
    failedToProcessTextFile: "Failed to process text file",
    networkErrorDuringUpload: "Network error during upload",
    fileProcessingError: "File processing error",
    uploadError: "Upload error",
  },

  // File processing
  fileProcessing: {
    processing: "Processing...",
    uploadComplete: "Upload complete",
    processingComplete: "Processing complete",
    ready: "Ready",
  },

  // UI labels
  labels: {
    upload: "Upload",
    process: "Process",
    cancel: "Cancel",
    retry: "Retry",
    clear: "Clear",
    select: "Select",
  },

  // Accessibility labels
  accessibility: {
    chromaControl: "Chroma control",
    animationSpeedControl: "Animation speed control",
    fileUploadButton: "File upload button",
    processingStatus: "Processing status",
  },

  // Time labels
  time: {
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This week",
    thisMonth: "This month",
    older: "Older",
  },
} as const;

export default captionTranslations;
