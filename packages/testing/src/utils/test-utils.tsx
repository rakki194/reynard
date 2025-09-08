import { Component, JSX, createComponent, createContext, useContext } from 'solid-js';
import { render } from '@solidjs/testing-library';
import { vi } from 'vitest';

/**
 * Test-specific app context that doesn't use router primitives
 */
const TestAppContext = createContext<any>();

const TestAppProvider: Component<{ children: JSX.Element }> = props => {
  // Create a mock app context that provides all the necessary properties
  const mockContext = {
    prevRoute: undefined,
    location: {
      pathname: '/test',
      search: '',
      hash: '',
      href: '/test',
      origin: 'http://localhost',
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      state: null,
    },
    theme: 'light',
    setTheme: vi.fn(),
    instantDelete: false,
    setInstantDelete: vi.fn(),
    disableAnimations: false,
    setDisableAnimations: vi.fn(),
    disableNonsense: false,
    setDisableNonsense: vi.fn(),
    disableCollisionHandling: false,
    setDisableCollisionHandling: vi.fn(),
    jtp2: {
      threshold: 0.5,
      forceCpu: false,
      setThreshold: vi.fn(),
      setForceCpu: vi.fn(),
    },
    wdv3: {
      modelName: '',
      genThreshold: 0.5,
      charThreshold: 0.5,
      forceCpu: false,
      setModelName: vi.fn(),
      setGenThreshold: vi.fn(),
      setCharThreshold: vi.fn(),
      setForceCpu: vi.fn(),
    },
    wdv3ModelName: '',
    wdv3GenThreshold: 0.5,
    wdv3CharThreshold: 0.5,
    setWdv3ModelName: vi.fn(),
    setWdv3GenThreshold: vi.fn(),
    setWdv3CharThreshold: vi.fn(),
    enableZoom: true,
    enableMinimap: true,
    setEnableZoom: vi.fn(),
    setEnableMinimap: vi.fn(),
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        'tools.undo': 'Undo',
        'tools.removeCommas': 'Remove commas',
        'tools.replaceNewlinesWithCommas': 'Replace newlines with commas',
        'tools.replaceUnderscoresWithSpaces': 'Replace underscores with spaces',
        'Add a tag...': 'Add a tag...',
        'Remove tag': 'Remove tag',
        'Add tag': 'Add tag',
        'Delete tags caption': 'Delete tags caption',
        'Undo last change': 'Undo last change',
        'gallery.addCaption': 'Add caption',
        'gallery.addTag': 'Add a tag...',
      };
      return translations[key] || key;
    },
    preserveLatents: false,
    preserveTxt: false,
    setPreserveLatents: vi.fn(),
    setPreserveTxt: vi.fn(),
    alwaysShowCaptionEditor: false,
    setAlwaysShowCaptionEditor: vi.fn(),
    replaceUnderscoresInTags: false,
    setReplaceUnderscoresInTags: vi.fn(),
    tagSuggestionsPath: '',
    setTagSuggestionsPath: vi.fn(),
    updateTagSuggestionsPath: vi.fn(),
    tagBubbleFontSize: 12,
    setTagBubbleFontSize: vi.fn(),
    tagBubbleColorIntensity: 1.0,
    setTagBubbleColorIntensity: vi.fn(),
    tagBubbleBorderRadius: 4,
    setTagBubbleBorderRadius: vi.fn(),
    tagBubblePadding: 4,
    setTagBubblePadding: vi.fn(),
    tagBubbleSpacing: 4,
    setTagBubbleSpacing: vi.fn(),
    enableTagBubbleAnimations: true,
    setEnableTagBubbleAnimations: vi.fn(),
    enableTagBubbleShadows: true,
    setEnableTagBubbleShadows: vi.fn(),
    minCharactersForSuggestions: 2,
    setMinCharactersForSuggestions: vi.fn(),
    maxSuggestions: 10,
    setMaxSuggestions: vi.fn(),
    boundingBoxExportFormat: 'yolo' as any,
    setBoundingBoxExportFormat: vi.fn(),
    boundingBoxShowLabels: true,
    setBoundingBoxShowLabels: vi.fn(),
    boundingBoxLabelFontSize: 12,
    setBoundingBoxLabelFontSize: vi.fn(),
    boundingBoxOpacity: 0.5,
    setBoundingBoxOpacity: vi.fn(),
    boundingBoxBorderWidth: 2,
    setBoundingBoxBorderWidth: vi.fn(),
    boundingBoxColorCodedLabels: false,
    setBoundingBoxColorCodedLabels: vi.fn(),
    boundingBoxAutoSave: true,
    setBoundingBoxAutoSave: vi.fn(),
    boundingBoxConfirmDelete: true,
    setBoundingBoxConfirmDelete: vi.fn(),
    boundingBoxSnapToGrid: false,
    setBoundingBoxSnapToGrid: vi.fn(),
    boundingBoxGridSize: 10,
    setBoundingBoxGridSize: vi.fn(),
    boundingBoxMinSize: 10,
    setBoundingBoxMinSize: vi.fn(),
    boundingBoxDefaultLabel: '',
    setBoundingBoxDefaultLabel: vi.fn(),
    segmentationMaskOpacity: 0.5,
    setSegmentationMaskOpacity: vi.fn(),
    segmentationMaskBorderWidth: 2,
    setSegmentationMaskBorderWidth: vi.fn(),
    segmentationMaskColorCodedLabels: false,
    setSegmentationMaskColorCodedLabels: vi.fn(),
    thumbnailThreads: 4,
    imageInfoThreads: 4,
    maxCpuCores: 8,
    setThumbnailThreads: vi.fn(),
    setImageInfoThreads: vi.fn(),
    fetchSystemInfo: vi.fn(),
    syncThreadSettingsToBackend: vi.fn(),
    fastIndexingMode: false,
    setFastIndexingMode: vi.fn(),
    indexingEnabled: true,
    setIndexingEnabled: vi.fn(),
    defaultGitignore: '',
    setDefaultGitignore: vi.fn(),
    gitLfsEnabled: false,
    setGitLfsEnabled: vi.fn(),
    gitLfsPatterns: [],
    setGitLfsPatterns: vi.fn(),
    gitAuthorName: '',
    setGitAuthorName: vi.fn(),
    gitAuthorEmail: '',
    setGitAuthorEmail: vi.fn(),
    setPath: vi.fn(),
    captioners: {},
    startJoyCaptionDownload: vi.fn(),
    isLoggedIn: false,
    userRole: null,
    login: vi.fn(),
    logout: vi.fn(),
    disableModelDownloads: false,
    setDisableModelDownloads: vi.fn(),
    authFetch: vi.fn(),
    notify: vi.fn(),
    createNotification: vi.fn(),
    thumbnailSize: 200,
    setThumbnailSize: vi.fn(),
  };

  return <TestAppContext.Provider value={mockContext} children={props.children} />;
};

/**
 * Hook to use the test app context
 */
export const useTestAppContext = () => {
  const context = useContext(TestAppContext);
  if (!context) {
    throw new Error('useTestAppContext must be used within TestAppProvider');
  }
  return context;
};

/**
 * Custom render function that includes common providers
 */
export function renderWithTestProviders(
  ui: () => JSX.Element,
  options?: Parameters<typeof render>[1]
): ReturnType<typeof render> {
  return render(() => <TestAppProvider children={ui()} />, options);
}

/**
 * Helper to create mock resources
 */
export function createMockTestResource<T>(data: T): any {
  const resource = (() => data) as any;
  resource.loading = false;
  resource.error = undefined;
  resource.latest = data;
  resource.state = 'ready';
  return resource;
}

/**
 * Common mock functions for testing
 */
export const mockFns = {
  saveCaption: Object.assign(
    vi.fn(async () => new Response()),
    { mockClear: vi.fn() }
  ),
  deleteCaption: Object.assign(
    vi.fn(async () => new Response()),
    { mockClear: vi.fn() }
  ),
  saveWithHistory: Object.assign(
    vi.fn(async () => new Response()),
    { mockClear: vi.fn() }
  ),
  undo: Object.assign(
    vi.fn(async () => new Response()),
    { mockClear: vi.fn() }
  ),
};

/**
 * Common mock app context
 */
export const mockAppContext = {
  t: (key: string) => {
    const translations: Record<string, string> = {
      'tools.undo': 'Undo',
      'tools.removeCommas': 'Remove commas',
      'tools.replaceNewlinesWithCommas': 'Replace newlines with commas',
      'tools.replaceUnderscoresWithSpaces': 'Replace underscores with spaces',
      'Add a tag...': 'Add a tag...',
      'Remove tag': 'Remove tag',
      'Add tag': 'Add tag',
      'Delete tags caption': 'Delete tags caption',
      'Undo last change': 'Undo last change',
      'gallery.addCaption': 'Add caption',
    };
    return translations[key] || key;
  },
  theme: 'light',
  setTheme: vi.fn(),
  preserveLatents: false,
  preserveTxt: false,
  enableZoom: true,
  enableMinimap: true,
  thumbnailSize: 250,
  createNotification: vi.fn(),
  // Auth-related properties
  isLoggedIn: false,
  userRole: null,
  login: vi.fn(),
  logout: vi.fn(),
  // Required properties for UserProfileBadge
  notify: vi.fn(),
  // Add other required properties with default values
  prevRoute: undefined,
  location: {} as any,
  instantDelete: false,
  setInstantDelete: vi.fn(),
  disableAnimations: false,
  setDisableAnimations: vi.fn(),
  disableNonsense: false,
  setDisableNonsense: vi.fn(),
  disableCollisionHandling: false,
  setDisableCollisionHandling: vi.fn(),
  jtp2: {
    threshold: 0.5,
    forceCpu: false,
    setThreshold: vi.fn(),
    setForceCpu: vi.fn(),
  },
  wdv3: {
    modelName: '',
    genThreshold: 0.5,
    charThreshold: 0.5,
    forceCpu: false,
    setModelName: vi.fn(),
    setGenThreshold: vi.fn(),
    setCharThreshold: vi.fn(),
    setForceCpu: vi.fn(),
  },
  wdv3ModelName: '',
  wdv3GenThreshold: 0.5,
  wdv3CharThreshold: 0.5,
  setWdv3ModelName: vi.fn(),
  setWdv3GenThreshold: vi.fn(),
  setWdv3CharThreshold: vi.fn(),
  setEnableZoom: vi.fn(),
  setEnableMinimap: vi.fn(),
  locale: 'en' as any,
  setLocale: vi.fn(),
  setPreserveLatents: vi.fn(),
  setPreserveTxt: vi.fn(),
  alwaysShowCaptionEditor: false,
  setAlwaysShowCaptionEditor: vi.fn(),
  setThumbnailSize: vi.fn(),
  replaceUnderscoresInTags: false,
  setReplaceUnderscoresInTags: vi.fn(),
  tagSuggestionsPath: '',
  setTagSuggestionsPath: vi.fn(),
  updateTagSuggestionsPath: vi.fn(),
  tagBubbleFontSize: 12,
  setTagBubbleFontSize: vi.fn(),
  tagBubbleColorIntensity: 0.5,
  setTagBubbleColorIntensity: vi.fn(),
  tagBubbleBorderRadius: 4,
  setTagBubbleBorderRadius: vi.fn(),
  tagBubblePadding: 4,
  setTagBubblePadding: vi.fn(),
  tagBubbleSpacing: 4,
  setTagBubbleSpacing: vi.fn(),
  enableTagBubbleAnimations: true,
  setEnableTagBubbleAnimations: vi.fn(),
  enableTagBubbleShadows: true,
  setEnableTagBubbleShadows: vi.fn(),
  minCharactersForSuggestions: 2,
  setMinCharactersForSuggestions: vi.fn(),
  maxSuggestions: 10,
  setMaxSuggestions: vi.fn(),
  boundingBoxExportFormat: 'yolo' as any,
  setBoundingBoxExportFormat: vi.fn(),
  boundingBoxShowLabels: true,
  setBoundingBoxShowLabels: vi.fn(),
  boundingBoxLabelFontSize: 12,
  setBoundingBoxLabelFontSize: vi.fn(),
  boundingBoxOpacity: 0.5,
  setBoundingBoxOpacity: vi.fn(),
  boundingBoxBorderWidth: 2,
  setBoundingBoxBorderWidth: vi.fn(),
  boundingBoxColorCodedLabels: false,
  setBoundingBoxColorCodedLabels: vi.fn(),
  boundingBoxAutoSave: true,
  setBoundingBoxAutoSave: vi.fn(),
  boundingBoxConfirmDelete: true,
  setBoundingBoxConfirmDelete: vi.fn(),
  boundingBoxSnapToGrid: false,
  setBoundingBoxSnapToGrid: vi.fn(),
  boundingBoxGridSize: 10,
  setBoundingBoxGridSize: vi.fn(),
  boundingBoxMinSize: 10,
  setBoundingBoxMinSize: vi.fn(),
  boundingBoxDefaultLabel: '',
  setBoundingBoxDefaultLabel: vi.fn(),
  thumbnailThreads: 4,
  imageInfoThreads: 4,
  maxCpuCores: 4,
  setThumbnailThreads: vi.fn(),
  setImageInfoThreads: vi.fn(),
  fetchSystemInfo: vi.fn(),
  syncThreadSettingsToBackend: vi.fn(),
  fastIndexingMode: false,
  setFastIndexingMode: vi.fn(),
  indexingEnabled: true,
  setIndexingEnabled: vi.fn(),
  defaultGitignore: '',
  setDefaultGitignore: vi.fn(),
  gitLfsEnabled: false,
  setGitLfsEnabled: vi.fn(),
  gitLfsPatterns: [],
  setGitLfsPatterns: vi.fn(),
  gitAuthorName: '',
  setGitAuthorName: vi.fn(),
  gitAuthorEmail: '',
  setGitAuthorEmail: vi.fn(),
  setPath: vi.fn(),
  captioners: {
    checkJoyCaptionDownload: vi.fn(),
  },
  startJoyCaptionDownload: vi.fn(),
  disableModelDownloads: false,
  setDisableModelDownloads: vi.fn(),
  authFetch: vi.fn(),
};
