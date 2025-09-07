/**
 * Settings translation type definitions for the Reynard i18n system.
 * 
 * This module contains the comprehensive settings translation interfaces
 * inspired by Yipyap's comprehensive system.
 */

import type { TranslationParams, ThemeTranslations } from "./common-types";

// Settings translations (expanded from Yipyap)
export interface SettingsTranslations {
  title: string;
  appearance: string;
  theme: ThemeTranslations;
  disableAnimations: string;
  disableAnimationsTooltip: string;
  language: string;
  languageTooltip: string;
  disableNonsense: string;
  disableNonsenseTooltip: string;
  disableCollisionHandling: string;
  disableCollisionHandlingTooltip: string;
  disableModelDownloads: string;
  disableModelDownloadsTooltip: string;
  modelSettings: string | ((params: TranslationParams) => string);
  modelManagement: {
    title: string;
  };
  jtp2Threshold: string;
  jtp2ThresholdTooltip: string;
  jtp2ForceCpu: string;
  jtp2ForceCpuTooltip: string;
  downloadModel: string;
  downloadTags: string;
  wdv3ModelName: string;
  wdv3ModelNameTooltip: string;
  wdv3GenThreshold: string;
  wdv3GenThresholdTooltip: string;
  wdv3CharThreshold: string;
  wdv3CharThresholdTooltip: string;
  wdv3ForceCpu: string;
  wdv3ForceCpuTooltip: string;
  wdv3ConfigUpdateError: string;
  viewMode: string;
  gridView: string;
  listView: string;
  sortBy: string;
  sortByName: string;
  sortByBasename: string;
  sortByDate: string;
  sortByDateOldest: string;
  sortBySize: string;
  sortBySizeSmallest: string;
  experimentalFeatures: string;
  enableZoom: string;
  enableZoomTooltip: string;
  enableMinimap: string;
  enableMinimapTooltip: string;
  alwaysShowCaptionEditor: string;
  alwaysShowCaptionEditorTooltip: string;
  treatMetadataAsText: string;
  treatMetadataAsTextTooltip: string;
  showMetadataInBreadcrumb: string;
  showMetadataInBreadcrumbTooltip: string;
  instantDelete: string;
  instantDeleteTooltip: string;
  warning: string;
  gallery: string;
  preserveLatents: string;
  preserveLatentsTooltip: string;
  preserveTxt: string;
  preserveTxtTooltip: string;
  thumbnailSize: string;
  thumbnailSizeDescription: string;
  thumbnailSizeUpdateError: string;
  replaceUnderscores: string;
  replaceUnderscoresDesc: string;
  tagSuggestions: {
    title: string;
    advanced: string;
  };
  tagSuggestionsPath: string;
  tagSuggestionsPathTooltip: string;
  tagSuggestionsPathDescription: string;
  tagBubbles: {
    title: string;
  };
  tagBubbleFontSize: string;
  tagBubbleFontSizeTooltip: string;
  tagBubbleColorIntensity: string;
  tagBubbleColorIntensityTooltip: string;
  tagBubbleBorderRadius: string;
  tagBubbleBorderRadiusTooltip: string;
  tagBubblePadding: string;
  tagBubblePaddingTooltip: string;
  tagBubbleSpacing: string;
  tagBubbleSpacingTooltip: string;
  enableTagBubbleAnimations: string;
  enableTagBubbleAnimationsTooltip: string;
  enableTagBubbleShadows: string;
  enableTagBubbleShadowsTooltip: string;
  minCharactersForSuggestions: string;
  minCharactersForSuggestionsTooltip: string;
  maxSuggestions: string;
  maxSuggestionsTooltip: string;
  captionTypes: {
    title: string;
    description: string;
    add: string;
    edit: string;
    remove: string;
    enable: string;
    disable: string;
    reset: string;
    resetTooltip: string;
    confirmRemove: string;
    confirmReset: string;
    addTitle: string;
    editTitle: string;
    idLabel: string;
    nameLabel: string;
    descriptionLabel: string;
    iconLabel: string;
    colorLabel: string;
    resetColor: string;
    colorHelp: string;
    idPattern: string;
    idHelp: string;
    descriptionPlaceholder: string;
  };
  boundingBox: {
    title: string;
    exportFormat: {
      title: string;
      label: string;
      tooltip: string;
      description: string;
    };
    labelDisplay: {
      title: string;
    };
    appearance: {
      title: string;
    };
    interaction: {
      title: string;
    };
    advanced: {
      title: string;
    };
    showLabels: string;
    showLabelsTooltip: string;
    labelFontSize: string;
    labelFontSizeTooltip: string;
    boxOpacity: string;
    boxOpacityTooltip: string;
    borderWidth: string;
    borderWidthTooltip: string;
    colorCodedLabels: string;
    colorCodedLabelsTooltip: string;
    autoSave: string;
    autoSaveTooltip: string;
    confirmDelete: string;
    confirmDeleteTooltip: string;
    snapToGrid: string;
    snapToGridTooltip: string;
    gridSize: string;
    gridSizeTooltip: string;
    minBoxSize: string;
    minBoxSizeTooltip: string;
    defaultLabel: string;
    defaultLabelTooltip: string;
    defaultLabelDescription: string;
    formatChanged: string;
    convertingBoxes: string;
    conversionSuccess: string;
    conversionNoBoxes: string;
    conversionNoGallery: string;
    conversionErrors: string;
    conversionFailed: string;
  };
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
