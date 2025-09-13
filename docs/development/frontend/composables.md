# Composables

SolidJS composables in the Reynard framework live in `packages/composables/` and are prefixed with `use`. They
hide reusable reactive logic behind typed, minimal APIs and are designed to be modular and
reusable across different Reynard applications.

## Conventions

- Single responsibility and explicit return types (signals, memos, actions)
- Lazy side-effects and onCleanup teardown inside the composable
- Passive event listeners for scroll/touch by default; avoid `preventDefault`
  unless necessary
- Prefer small signals/memos over large derived objects to limit re-computation
  and re-rendering
- Accept narrowly scoped options; avoid deep config objects

## Current Composable Inventory

The Reynard framework contains **80+ composables** organized by functionality across multiple packages:

### Core State Management (packages/core)

- `useAuthFetch.ts` - Authentication-aware fetch with token refresh
- `useServiceManager.ts` - Service status and health monitoring
- `useIndexing.ts` - Indexing operations and state
- `useNotifications.ts` - Notification system integration

### UI Interactions

- `useDragAndDrop.tsx` - File drag and drop functionality
- `useScrollCoordinator.ts` - Advanced scroll coordination
- `useShortcutEngine.ts` - Keyboard shortcut management
- `useGalleryScroll.tsx` - Gallery-specific scroll handling
- `useGlobalEscapeManager.tsx` - Global escape key handling

### Content Processing

- `useUnifiedCaptionGeneration.ts` - Multi-model caption generation
- `useDetectionModels.ts` - Object detection integration
- `useDiffusionLLM.ts` - Text generation with DreamOn/LLaDA models
- `useRAG.ts` - Retrieval-augmented generation
- `useRAGSearch.ts` - RAG search functionality
- `useRAGFileProcessing.ts` - RAG file processing

### AI Integration

- `useComfy.ts` - ComfyUI workflow management
- `useComfyModels.ts` - ComfyUI model management
- `useComfyWorkflow.ts` - Workflow operations
- `useComfyQueue.ts` - Queue management
- `useComfyPresets.ts` - Preset management
- `useOllama.ts` - Ollama integration
- `useCrawl.ts` - Web crawling functionality

### Performance & Monitoring

- `usePerformanceMonitor.ts` - Performance tracking
- `useProgressiveLoading.ts` - Progressive loading strategies
- `useVirtualSelection.ts` - Virtual selection optimization
- `useScrollPerformanceMonitor.ts` - Scroll performance monitoring
- `useMemory.ts` - Memory usage tracking
- `useMemoryAlerts.ts` - Memory alert system

### Visualization & Analysis

- `useVisualizationProgress.ts` - Visualization progress tracking
- `useVisualizationExport.ts` - Export functionality
- `useEmbeddingReduction.ts` - Embedding dimensionality reduction
- `useBoxTransform.ts` - Bounding box transformations
- `useBoxResize.ts` - Box resizing operations
- `useBoxMove.ts` - Box movement operations
- `useOverlappingBoxCycling.ts` - Overlapping box management

### File Operations

- `useFileUpload.tsx` - File upload functionality
- `useGlobalFileUpload.ts` - Global upload state
- `useCaptionRequestQueue.ts` - Caption request queuing
- `useCaptionHistory.tsx` - Caption history management

### Git Integration

- `useGitManager.ts` - Git operations management
- `useGitOperations.ts` - Core git operations
- `useGitData.ts` - Git data management
- `useGlobalGitStatus.ts` - Global git status

### Advanced Features

- `useServiceAwareFeatures.ts` - Service-aware feature management
- `useServiceAwareAuth.ts` - Service-aware authentication
- `useServiceNotifications.ts` - Service notification integration
- `useSearchIntegration.ts` - Search system integration
- `useEnhancedSummarize.ts` - Enhanced summarization
- `useSummarize.ts` - Basic summarization
- `useSummaryComparison.ts` - Summary comparison tools

### Development & Testing

- `useConfigWatcher.ts` - Configuration watching
- `useModelUsage.ts` - Model usage tracking
- `useModelUsageTrackerConfig.ts` - Usage tracker configuration
- `useModelLoadingStates.ts` - Model loading state management
- `useLanguageDetection.ts` - Language detection
- `useConnectionStatus.ts` - Connection status monitoring

## Example: Comfy

`useComfy` exposes typed actions to queue and monitor Comfy jobs with
retry/backoff and notification groups. It returns functions for `queueWorkflow`,
`textToImage`, `subscribeToStatus`, `fetchImage`, `ingestImage`, and
`getComfyInfo`. It ensures EventSource cleanup via `onCleanup`.

## Testing

Write tests that simulate rapid state changes and unmount cleanup. Validate that
passive listeners do not block scrolling. Follow the existing `vitest` and
Testing Library setup and assert that resource cleanup runs on disposal.

- Files:
  - `src/composables/*`
  - `docs/passive-events.md`

## Lifecycle and cleanup

Composables should set up side effects lazily and always tear them down. Use
`onCleanup` to close streaming connections, clear timers, and remove listeners.
In `useComfy`, the `EventSource` is closed on disposal to prevent leaks. In
`useAuthFetch`, the proactive refresh timer is cleared on cleanup. Prefer
`onMount` only when you must access the DOM; otherwise, set up work at first use
or inside returned actions to keep initialization cheap.

Timers and animation frames must be tracked and cleared. In `useGalleryScroll`,
both `requestAnimationFrame` handles and `setInterval` IDs are stored and
cancelled during cleanup to avoid work after unmount.

## Event listeners and performance

Follow the passive event listener guidance for scroll and touch interactions.
The default should be passive to improve scrolling performance, switching to
non-passive only when you call `preventDefault`. The `docs/passive-events.md`
document contains the full rationale and examples.

The crawl streaming composable registers SSE-specific listeners with passive
options, which is appropriate because no default behavior is prevented:

```startLine:98:endLine:107:src/composables/useCrawl.ts
es.addEventListener("submitted", (ev) => {
    try { handlers.onSubmitted?.(JSON.parse((ev as MessageEvent).data)); } catch { }
}, { passive: true } as any);
es.addEventListener("status", (ev) => {
    try { handlers.onStatus?.(JSON.parse((ev as MessageEvent).data)); } catch { }
}, { passive: true } as any);
es.addEventListener("done", (ev) => {
    try { handlers.onDone?.(JSON.parse((ev as MessageEvent).data)); } catch { }
    stop();
}, { passive: true } as any);
```

By contrast, gallery wheel navigation intentionally uses a non-passive listener
because it prevents the page from scrolling while using the wheel to navigate
images:

```startLine:290:endLine:405:src/composables/useGalleryScroll.tsx
// Prevent multiple handlers
if (wheelHandler) {
  galleryElement.removeEventListener('wheel', wheelHandler);
}

wheelHandler = (e: WheelEvent) => {
  e.preventDefault();
  // ... image navigation logic ...
};

// Use passive listener for performance where possible; here we require preventDefault
galleryElement.addEventListener('wheel', wheelHandler, { passive: false });
```

When adding listeners on `document` or `window`, keep the handler in a variable
so you can remove it exactly during cleanup. Prefer `{ once: true }` when
appropriate to reduce bookkeeping.

## Streaming and cancellation

For streaming APIs, provide cancellation with `AbortController` and support an
optional external `AbortSignal` so callers can compose cancellation. In
`useDiffusionLLM`, streaming helpers accept an external signal and attach an
abort handler, while managing an internal controller when none is provided. Idle
timeouts ensure streams do not hang indefinitely.

When using Server-Sent Events (`EventSource`), expose a small handle or a stop
function from the composable so callers can terminate the stream. Always close
the `EventSource` on completion and in `onCleanup`.

## Typing and API shape

Return only the reactive primitives and actions that consumers need. Prefer
narrow, explicit types over large objects. Use `Accessor<T>`, `Setter<T>`, or
`createResource` result tuples where suitable, and return typed functions for
actions. When returning an object, finalize the surface with `as const` if you
want callers to consume stable, read-only properties without accidental
mutation.

Keep options narrowly scoped and typed. Instead of deep configuration objects,
accept a small options parameter with explicit fields and defaults. This
improves discoverability and avoids reactivity work when unrelated fields
change.

## SSR safety and DOM access

Guard all DOM access behind `onMount` so composables are safe to import in
non-DOM environments and during testing. Check for `window` or `document` only
inside `onMount` or returned actions that are called client-side. Avoid reading
layout or sizes during module initialization.

## Testing composables

Write tests that cover rapid mount/unmount and cleanup behavior. Simulate aborts
and ensure timers are cleared. For networked actions, inject fakes or pass in
`AbortSignal` instances you can abort deterministically. In tests that could
schedule intervals, gate timer setup behind environment checks as seen in
`useAuthFetch` to avoid runaway timers under `vitest`.

## Examples from the codebase

Authentication fetch keeps its API minimal while managing token refresh and
timer lifecycle. It exposes a typed `authFetch` function and tears down its
interval on cleanup. Comfy workflow helpers return focused actions and close
their `EventSource` when complete. Gallery scroll returns a small set of
functions and signals, and coordinates scrolling via a dedicated manager for
smooth behavior.

Refer to these files for concrete, production-grade patterns:

- `src/composables/useAuthFetch.ts`
- `src/composables/useComfy.ts`
- `src/composables/useDiffusionLLM.ts`
- `src/composables/useCrawl.ts`
- `src/composables/useGalleryScroll.tsx`
