/**
 * Testing Package Translations
 * Translations for the Reynard Testing framework
 */

export const testingTranslations = {
  // Mock utilities
  mockUtils: {
    files: "Files",
  },

  // i18n testing patterns
  i18nTesting: {
    jsxText: "JSX Text",
    jsxAttribute: "JSX Attribute",
    templateLiteral: "Template Literal",
    userFacingString: "User-facing String",
    returnStatement: "Return Statement",
    consoleLog: "Console Log",
    errorMessage: "Error Message",
    successMessage: "Success Message",
    warningMessage: "Warning Message",
    infoMessage: "Info Message",
  },

  // Test patterns and examples
  testPatterns: {
    helloWorld: "Hello world",
    componentI18n: "Component i18n",
    translationCompleteness: "Translation completeness",
    componentCode: "Component.tsx",
  },

  // File types and extensions
  fileTypes: {
    files: "Files",
    types: "Types",
  },

  // Testing utilities
  utilities: {
    detectHardcodedStrings: "Detect Hardcoded Strings",
    validateTranslations: "Validate Translations",
    generateReport: "Generate Report",
  },

  // Error messages
  errors: {
    testFailed: "Test failed",
    validationError: "Validation error",
    missingTranslation: "Missing translation",
    invalidPattern: "Invalid pattern",
  },

  // Success messages
  success: {
    testPassed: "Test passed",
    validationSuccess: "Validation successful",
    translationComplete: "Translation complete",
  },
} as const;

export default testingTranslations;
