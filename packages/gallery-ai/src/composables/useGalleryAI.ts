/**
 * useGalleryAI Composable
 *
 * Main composable for AI-enhanced gallery functionality.
 * Integrates with the annotation system to provide caption generation,
 * batch processing, and AI-powered features.
 */

import {
  createSignal,
  createEffect,
  onCleanup,
  createContext,
  useContext,
} from "solid-js";
// Note: These imports will be available when the packages are built
// For now, we'll define the types locally to avoid build errors

interface CaptionTask {
  imagePath: string;
  generatorName: string;
  config: any;
  postProcess: boolean;
  force: boolean;
}

class AnnotationManager {
  async start(): Promise<void> {
    // Mock implementation
  }

  async stop(): Promise<void> {
    // Mock implementation
  }

  getAvailableGenerators(): any[] {
    // Mock implementation
    return [];
  }

  getService(): any {
    // Mock implementation
    return {
      generateCaption: async (task: CaptionTask) => ({
        success: true,
        caption: "Mock caption",
        processingTime: 1000,
        captionType: "caption",
        generator: task.generatorName,
      }),
      generateBatchCaptions: async (
        tasks: CaptionTask[],
        _progressCallback: (progress: any) => void,
      ) => {
        // Mock batch processing
        return tasks.map((task) => ({
          success: true,
          caption: "Mock caption",
          processingTime: 1000,
          captionType: "caption",
          generator: task.generatorName,
        }));
      },
    };
  }
}
import type {
  AIGalleryState,
  AIGalleryConfig,
  UseGalleryAIOptions,
  UseGalleryAIReturn,
  CaptionResult,
} from "../types";
import { AIOperationStatus, CaptionType } from "../types";

// Default AI configuration
const DEFAULT_AI_CONFIG: AIGalleryConfig = {
  defaultGenerator: "jtp2",
  autoGenerateOnUpload: false,
  batchSettings: {
    maxConcurrent: 3,
    retryFailed: true,
    maxRetries: 2,
    progressInterval: 1000,
  },
  captionSettings: {
    defaultCaptionType: CaptionType.CAPTION,
    postProcessing: true,
    forceRegeneration: false,
    generatorConfigs: {},
  },
  uiPreferences: {
    showAIIndicators: true,
    showProgress: true,
    autoExpandCaptionEditor: false,
    showBatchControls: true,
  },
};

// Create context for AI gallery state
export const AIGalleryContext = createContext<UseGalleryAIReturn | undefined>();

export function useAIGalleryContext(): UseGalleryAIReturn {
  const context = useContext(AIGalleryContext);
  if (!context) {
    throw new Error(
      "useAIGalleryContext must be used within an AIGalleryProvider",
    );
  }
  return context;
}

export function useGalleryAI(
  options: UseGalleryAIOptions = {},
): UseGalleryAIReturn {
  const {
    initialConfig = {},
    autoInitialize = true,
    callbacks = {},
    persistState = true,
    storageKey = "reynard-gallery-ai",
  } = options;

  // Load persisted state
  const loadPersistedState = <T>(key: string, defaultValue: T): T => {
    if (!persistState || typeof localStorage === "undefined") {
      return defaultValue;
    }

    try {
      const stored = localStorage.getItem(`${storageKey}-${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Save state to localStorage
  const saveState = <T>(key: string, value: T): void => {
    if (!persistState || typeof localStorage === "undefined") return;

    try {
      localStorage.setItem(`${storageKey}-${key}`, JSON.stringify(value));
    } catch {
      // Ignore localStorage errors
    }
  };

  // Core state
  const [aiState, setAIState] = createSignal<AIGalleryState>({
    isGenerating: false,
    selectedGenerator: loadPersistedState(
      "selectedGenerator",
      initialConfig.defaultGenerator || DEFAULT_AI_CONFIG.defaultGenerator,
    ),
    availableGenerators: [],
    batchProgress: null,
    aiEnabled: loadPersistedState("aiEnabled", true),
    operationStatus: AIOperationStatus.IDLE,
    lastError: null,
    config: {
      ...DEFAULT_AI_CONFIG,
      ...initialConfig,
    },
  });

  // Annotation manager instance
  const [annotationManager] = createSignal<AnnotationManager>(
    new AnnotationManager(),
  );

  // Persist configuration changes
  createEffect(() => {
    const state = aiState();
    saveState("selectedGenerator", state.selectedGenerator);
    saveState("aiEnabled", state.aiEnabled);
  });

  // Initialize annotation manager
  createEffect(() => {
    if (autoInitialize) {
      initializeAnnotationManager();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    const manager = annotationManager();
    if (manager) {
      manager.stop().catch(console.error);
    }
  });

  /**
   * Initialize the annotation manager and load available generators
   */
  const initializeAnnotationManager = async (): Promise<void> => {
    try {
      const manager = annotationManager();
      await manager.start();

      const generators = manager.getAvailableGenerators();
      const generatorNames = generators.map((g: any) => g.name);

      setAIState((prev) => ({
        ...prev,
        availableGenerators: generatorNames,
        operationStatus: AIOperationStatus.IDLE,
      }));
    } catch (error) {
      console.error("Failed to initialize annotation manager:", error);
      setAIState((prev) => ({
        ...prev,
        operationStatus: AIOperationStatus.ERROR,
        lastError:
          error instanceof Error
            ? error.message
            : "Failed to initialize AI system",
      }));
    }
  };

  /**
   * Generate caption for a single item
   */
  const generateCaption = async (
    item: any,
    generator: string,
  ): Promise<CaptionResult> => {
    const state = aiState();
    if (!state.aiEnabled) {
      throw new Error("AI features are disabled");
    }

    setAIState((prev) => ({
      ...prev,
      isGenerating: true,
      operationStatus: AIOperationStatus.GENERATING,
      lastError: null,
    }));

    try {
      const manager = annotationManager();
      const service = manager.getService();

      const task: CaptionTask = {
        imagePath: item.path || item.name,
        generatorName: generator,
        config: state.config.captionSettings.generatorConfigs[generator] || {},
        postProcess: state.config.captionSettings.postProcessing,
        force: state.config.captionSettings.forceRegeneration,
      };

      // Call callback
      callbacks.onCaptionGenerationStart?.(item, generator);

      const result = await service.generateCaption(task);

      setAIState((prev) => ({
        ...prev,
        isGenerating: false,
        operationStatus: AIOperationStatus.SUCCESS,
      }));

      // Call success callback
      callbacks.onCaptionGenerationComplete?.(item, result);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Caption generation failed";

      setAIState((prev) => ({
        ...prev,
        isGenerating: false,
        operationStatus: AIOperationStatus.ERROR,
        lastError: errorMessage,
      }));

      // Call error callback
      callbacks.onCaptionGenerationError?.(item, errorMessage);

      throw error;
    }
  };

  /**
   * Batch annotate multiple items
   */
  const batchAnnotate = async (
    items: any[],
    generator: string,
  ): Promise<CaptionResult[]> => {
    const state = aiState();
    if (!state.aiEnabled) {
      throw new Error("AI features are disabled");
    }

    setAIState((prev) => ({
      ...prev,
      isGenerating: true,
      operationStatus: AIOperationStatus.BATCH_PROCESSING,
      lastError: null,
    }));

    try {
      const manager = annotationManager();
      const service = manager.getService();

      const tasks: CaptionTask[] = items.map((item) => ({
        imagePath: item.path || item.name,
        generatorName: generator,
        config: state.config.captionSettings.generatorConfigs[generator] || {},
        postProcess: state.config.captionSettings.postProcessing,
        force: state.config.captionSettings.forceRegeneration,
      }));

      // Call callback
      callbacks.onBatchProcessingStart?.(items, generator);

      const results = await service.generateBatchCaptions(
        tasks,
        (progress: any) => {
          setAIState((prev) => ({
            ...prev,
            batchProgress: progress,
          }));

          // Call progress callback
          callbacks.onBatchProcessingProgress?.(progress);
        },
      );

      setAIState((prev) => ({
        ...prev,
        isGenerating: false,
        operationStatus: AIOperationStatus.SUCCESS,
        batchProgress: null,
      }));

      // Call success callback
      callbacks.onBatchProcessingComplete?.(results);

      return results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Batch processing failed";

      setAIState((prev) => ({
        ...prev,
        isGenerating: false,
        operationStatus: AIOperationStatus.ERROR,
        lastError: errorMessage,
        batchProgress: null,
      }));

      // Call error callback
      callbacks.onBatchProcessingError?.(errorMessage);

      throw error;
    }
  };

  /**
   * Update AI configuration
   */
  const updateAIConfig = (config: Partial<AIGalleryConfig>): void => {
    setAIState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ...config,
      },
    }));

    // Call callback
    callbacks.onAIConfigChange?.(aiState().config);
  };

  /**
   * Get available generators
   */
  const getAvailableGenerators = (): string[] => {
    return aiState().availableGenerators;
  };

  /**
   * Check if generator is available
   */
  const isGeneratorAvailable = (generator: string): boolean => {
    return aiState().availableGenerators.includes(generator);
  };

  /**
   * Get annotation manager
   */
  const getAnnotationManager = (): AnnotationManager => {
    return annotationManager();
  };

  /**
   * Clear AI state
   */
  const clearAIState = (): void => {
    setAIState((prev) => ({
      ...prev,
      isGenerating: false,
      batchProgress: null,
      operationStatus: AIOperationStatus.IDLE,
      lastError: null,
    }));
  };

  /**
   * Set AI enabled state
   */
  const setAIEnabled = (enabled: boolean): void => {
    setAIState((prev) => ({
      ...prev,
      aiEnabled: enabled,
    }));
  };

  // Computed values (for future use)
  // const isGenerating = createMemo(() => aiState().isGenerating);
  // const operationStatus = createMemo(() => aiState().operationStatus);
  // const lastError = createMemo(() => aiState().lastError);
  // const batchProgress = createMemo(() => aiState().batchProgress);

  return {
    aiState,
    generateCaption,
    batchAnnotate,
    updateAIConfig,
    getAvailableGenerators,
    isGeneratorAvailable,
    getAnnotationManager,
    clearAIState,
    setAIEnabled,
  };
}
