/**
 * useGalleryAI Composable
 *
 * Main composable for AI-enhanced gallery functionality.
 * Integrates with the annotation system to provide caption generation,
 * batch processing, and AI-powered features.
 */
import { createSignal, createEffect, onCleanup, createContext, useContext } from "solid-js";
import { CaptionType } from "reynard-ai-shared";
import { getAnnotationServiceRegistry, createDefaultAnnotationService, } from "reynard-annotating-core";
import { AIOperationStatus } from "../types";
// Default AI configuration
const DEFAULT_AI_CONFIG = {
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
export const AIGalleryContext = createContext();
export function useAIGalleryContext() {
    const context = useContext(AIGalleryContext);
    if (!context) {
        throw new Error("useAIGalleryContext must be used within an AIGalleryProvider");
    }
    return context;
}
export function useGalleryAI(options = {}) {
    const { initialConfig = {}, autoInitialize = true, callbacks = {}, persistState = true, storageKey = "reynard-gallery-ai", } = options;
    // Load persisted state
    const loadPersistedState = (key, defaultValue) => {
        if (!persistState || typeof localStorage === "undefined") {
            return defaultValue;
        }
        try {
            const stored = localStorage.getItem(`${storageKey}-${key}`);
            return stored ? JSON.parse(stored) : defaultValue;
        }
        catch {
            return defaultValue;
        }
    };
    // Save state to localStorage
    const saveState = (key, value) => {
        if (!persistState || typeof localStorage === "undefined")
            return;
        try {
            localStorage.setItem(`${storageKey}-${key}`, JSON.stringify(value));
        }
        catch {
            // Ignore localStorage errors
        }
    };
    // Core state
    const [aiState, setAIState] = createSignal({
        isGenerating: false,
        selectedGenerator: loadPersistedState("selectedGenerator", initialConfig.defaultGenerator || DEFAULT_AI_CONFIG.defaultGenerator),
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
    // Annotation service instance
    const [annotationService, setAnnotationService] = createSignal(null);
    // Persist configuration changes
    createEffect(() => {
        const state = aiState();
        saveState("selectedGenerator", state.selectedGenerator);
        saveState("aiEnabled", state.aiEnabled);
    });
    // Initialize annotation service
    createEffect(() => {
        if (autoInitialize) {
            initializeAnnotationService();
        }
    });
    // Cleanup on unmount
    onCleanup(() => {
        const service = annotationService();
        if (service) {
            service.stop().catch(console.error);
        }
    });
    /**
     * Initialize the annotation service and load available generators
     */
    const initializeAnnotationService = async () => {
        try {
            const registry = getAnnotationServiceRegistry();
            let service = registry.getAnnotationService("gallery-ai-service");
            if (!service) {
                // Create a default service if none exists
                service = createDefaultAnnotationService("http://localhost:8000", // Default backend URL
                "gallery-ai-service");
            }
            // Start the service if not already running
            if (!service.isInitialized) {
                await service.start();
            }
            // Update the signal
            setAnnotationService(service);
            const generators = await service.getAvailableGenerators();
            const generatorNames = generators.map((g) => g.name);
            setAIState(prev => ({
                ...prev,
                availableGenerators: generatorNames,
                operationStatus: AIOperationStatus.IDLE,
            }));
        }
        catch (error) {
            console.error("Failed to initialize annotation service:", error);
            setAIState(prev => ({
                ...prev,
                operationStatus: AIOperationStatus.ERROR,
                lastError: error instanceof Error ? error.message : "Failed to initialize AI system",
            }));
        }
    };
    /**
     * Generate caption for a single item
     */
    const generateCaption = async (item, generator) => {
        const state = aiState();
        if (!state.aiEnabled) {
            throw new Error("AI features are disabled");
        }
        const service = annotationService();
        if (!service) {
            throw new Error("Annotation service is not initialized");
        }
        setAIState(prev => ({
            ...prev,
            isGenerating: true,
            operationStatus: AIOperationStatus.GENERATING,
            lastError: null,
        }));
        try {
            const task = {
                imagePath: item.path || item.name,
                generatorName: generator,
                config: state.config.captionSettings.generatorConfigs[generator] || {},
                postProcess: state.config.captionSettings.postProcessing,
                priority: 1,
                force: state.config.captionSettings.forceRegeneration,
                captionType: state.config.captionSettings.defaultCaptionType,
            };
            // Call callback
            callbacks.onCaptionGenerationStart?.(item, generator);
            const result = await service.generateCaption(task);
            // Convert ai-shared CaptionResult to GalleryCaptionResult
            const galleryResult = {
                success: result.success,
                caption: result.caption,
                processingTime: result.processingTime,
                captionType: result.captionType,
                generator: result.generatorName,
                imagePath: result.imagePath,
                error: result.error,
                metadata: result.metadata,
            };
            setAIState(prev => ({
                ...prev,
                isGenerating: false,
                operationStatus: AIOperationStatus.SUCCESS,
            }));
            // Call success callback
            callbacks.onCaptionGenerationComplete?.(item, galleryResult);
            return galleryResult;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Caption generation failed";
            setAIState(prev => ({
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
    const batchAnnotate = async (items, generator) => {
        const state = aiState();
        if (!state.aiEnabled) {
            throw new Error("AI features are disabled");
        }
        const service = annotationService();
        if (!service) {
            throw new Error("Annotation service is not initialized");
        }
        setAIState(prev => ({
            ...prev,
            isGenerating: true,
            operationStatus: AIOperationStatus.BATCH_PROCESSING,
            lastError: null,
        }));
        try {
            const tasks = items.map(item => ({
                imagePath: item.path || item.name,
                generatorName: generator,
                config: state.config.captionSettings.generatorConfigs[generator] || {},
                postProcess: state.config.captionSettings.postProcessing,
                priority: 1,
                force: state.config.captionSettings.forceRegeneration,
                captionType: state.config.captionSettings.defaultCaptionType,
            }));
            // Call callback
            callbacks.onBatchProcessingStart?.(items, generator);
            const results = await service.generateBatchCaptions(tasks, (progress) => {
                setAIState(prev => ({
                    ...prev,
                    batchProgress: progress,
                }));
                // Call progress callback
                callbacks.onBatchProcessingProgress?.(progress);
            });
            // Convert ai-shared CaptionResult[] to GalleryCaptionResult[]
            const galleryResults = results.map((result) => ({
                success: result.success,
                caption: result.caption,
                processingTime: result.processingTime,
                captionType: result.captionType,
                generator: result.generatorName,
                imagePath: result.imagePath,
                error: result.error,
                metadata: result.metadata,
            }));
            setAIState(prev => ({
                ...prev,
                isGenerating: false,
                operationStatus: AIOperationStatus.SUCCESS,
                batchProgress: null,
            }));
            // Call success callback
            callbacks.onBatchProcessingComplete?.(galleryResults);
            return galleryResults;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Batch processing failed";
            setAIState(prev => ({
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
    const updateAIConfig = (config) => {
        setAIState(prev => ({
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
    const getAvailableGenerators = () => {
        return aiState().availableGenerators;
    };
    /**
     * Check if generator is available
     */
    const isGeneratorAvailable = (generator) => {
        const service = annotationService();
        return service ? service.isGeneratorAvailable(generator) : false;
    };
    /**
     * Get annotation service
     */
    const getAnnotationService = () => {
        return annotationService();
    };
    /**
     * Clear AI state
     */
    const clearAIState = () => {
        setAIState(prev => ({
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
    const setAIEnabled = (enabled) => {
        setAIState(prev => ({
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
        getAnnotationService,
        clearAIState,
        setAIEnabled,
    };
}
