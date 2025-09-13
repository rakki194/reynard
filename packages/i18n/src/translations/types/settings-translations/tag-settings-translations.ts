/**
 * Tag and caption settings translation type definitions for the Reynard i18n system.
 *
 * This module contains tag suggestions, tag bubbles, caption types,
 * and bounding box settings translation interfaces.
 */

// Tag and caption settings translations
export interface TagSettingsTranslations {
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
}
