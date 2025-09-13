/**
 * Advanced settings translation type definitions for the Reynard i18n system.
 *
 * This module contains performance, danger zone, version control,
 * and captioner settings translation interfaces.
 */

// Advanced settings translations
export interface AdvancedSettingsTranslations {
  performance: {
    title: string;
    subtitle: string;
    thumbnailThreads: string;
    thumbnailThreadsDescription: string;
    imageInfoThreads: string;
    imageInfoThreadsDescription: string;
    systemCores: string;
    currentThumbnailThreads: string;
    currentImageInfoThreads: string;
    low: string;
    balanced: string;
    high: string;
    maximum: string;
    hint: string;
    modelUsageTracking: string;
    modelUsageTrackingDescription: string;
    modelUsageStatistics: string;
    modelUsageStatisticsDescription: string;
    trackedModels: string;
    loadedModels: string;
    cleanupInterval: string;
    cleanupIntervalDescription: string;
    refreshStats: string;
  };
  danger: {
    title: string;
    subtitle: string;
    warning: string;
  };
  dangerZone: string;
  dangerZoneDescription: string;
  versionControl: {
    title: string;
    gitLfsEnabled: string;
    gitLfsEnabledTooltip: string;
    gitLfsPatterns: string;
    gitLfsPatternsTooltip: string;
    gitLfsPatternsDescription: string;
    gitAuthorName: string;
    gitAuthorNameTooltip: string;
    gitAuthorEmail: string;
    gitAuthorEmailTooltip: string;
    setPathTooltip: string;
    setPathDescription: string;
    defaultGitignore: string;
    defaultGitignoreTooltip: string;
    defaultGitignoreDescription: string;
    addPattern: string;
    savePatterns: string;
    saveGitignore: string;
    gitConfigSaved: string;
    gitConfigError: string;
  };
  captioner: {
    title: string;
    description: string;
    noCaptioneersAvailable: string;
    loadingCaptioners: string;
    configuration: string;
    saveConfiguration: string;
    resetConfiguration: string;
    configurationSaved: string;
    configurationFailed: string;
    generalSettings: string;
    advancedSettings: string;
    captionGeneration: {
      title: string;
      postProcessing: {
        title: string;
        description: string;
        enabled: string;
        enabledTooltip: string;
        replaceUnderscores: string;
        replaceUnderscoresTooltip: string;
        caseConversion: string;
        caseConversionTooltip: string;
        caseConversionOptions: {
          none: string;
          lowercase: string;
          uppercase: string;
          titlecase: string;
        };
        trimWhitespace: string;
        trimWhitespaceTooltip: string;
        removeDuplicateSpaces: string;
        removeDuplicateSpacesTooltip: string;
      };
      generators: {
        title: string;
        description: string;
        selectPlaceholder: string;
      };
    };
  };
}
